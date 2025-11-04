"""Booking management system for scheduling appointments."""

import json
import logging
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

# Timezone Brasil
BRASIL_TZ = timezone(timedelta(hours=-3))

class BookingManager:
    """Manage appointment bookings with persistence."""

    def __init__(self, file_path: Optional[Path] = None):
        base_path = Path(__file__).resolve().parent.parent / "data" / "bookings.json"
        self._file_path = file_path or base_path
        self._file_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()

        # Initialize file if it doesn't exist
        if not self._file_path.exists():
            self._write_file({"bookings": []})

    def _read_file(self) -> Dict[str, Any]:
        """Read bookings from file."""
        with self._lock:
            try:
                with self._file_path.open("r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading bookings file: {e}")
                return {"bookings": []}

    def _write_file(self, data: Dict[str, Any]) -> None:
        """Write bookings to file."""
        with self._lock:
            try:
                tmp_path = self._file_path.with_suffix(".tmp")
                with tmp_path.open("w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                tmp_path.replace(self._file_path)
            except Exception as e:
                logger.error(f"Error writing bookings file: {e}")

    def create_booking(
            self,
            user_id: str,
            code: str,
            time: str,
            date: str,
            workflow_id: str
    ) -> bool:
        """Create a new booking."""
        try:
            data = self._read_file()

            booking = {
                "user_id": user_id,
                "code": code,
                "time": time,
                "date": date,
                "workflow_id": workflow_id,
                "status": "active",
                "created_at": datetime.now(BRASIL_TZ).isoformat(),
                "cancelled_at": None,
                "cancellation_reason": None
            }

            data["bookings"].append(booking)
            self._write_file(data)

            logger.info(f"Booking created: {code} for user {user_id} at {time} on {date}")
            return True

        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            return False

    def get_booking_by_code(self, code: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a booking by confirmation code and user ID."""
        try:
            data = self._read_file()

            for booking in data["bookings"]:
                if (booking["code"] == code and
                        booking["user_id"] == user_id and
                        booking["status"] == "active"):
                    return booking

            return None

        except Exception as e:
            logger.error(f"Error getting booking: {e}")
            return None

    def cancel_booking(self, code: str, user_id: str, reason: str) -> bool:
        """Cancel a booking with a reason."""
        try:
            data = self._read_file()

            for booking in data["bookings"]:
                if (booking["code"] == code and
                        booking["user_id"] == user_id and
                        booking["status"] == "active"):
                    booking["status"] = "cancelled"
                    booking["cancelled_at"] = datetime.now(BRASIL_TZ).isoformat()
                    booking["cancellation_reason"] = reason

                    self._write_file(data)
                    logger.info(f"Booking cancelled: {code} by user {user_id}")
                    return True

            return False

        except Exception as e:
            logger.error(f"Error cancelling booking: {e}")
            return False

    def get_booked_slots(self, workflow_id: str) -> List[Dict[str, str]]:
        """Get all active booked slots for a workflow."""
        try:
            data = self._read_file()

            booked_slots = []
            for booking in data["bookings"]:
                if (booking["workflow_id"] == workflow_id and
                        booking["status"] == "active"):
                    booked_slots.append({
                        "time": booking["time"],
                        "date": booking["date"]
                    })

            return booked_slots

        except Exception as e:
            logger.error(f"Error getting booked slots: {e}")
            return []

    def is_slot_booked(self, time: str, date: str, workflow_id: str) -> bool:
        """Check if a specific slot is already booked."""
        booked_slots = self.get_booked_slots(workflow_id)

        for slot in booked_slots:
            if slot["time"] == time and slot["date"] == date:
                return True

        return False

    def get_statistics(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """Get booking statistics for a date range."""
        try:
            data = self._read_file()

            stats = {
                "total_confirmed": 0,
                "total_cancelled": 0,
                "confirmed_by_date": {},
                "cancelled_by_date": {}
            }

            for booking in data["bookings"]:
                created_at = booking.get("created_at", "")
                cancelled_at = booking.get("cancelled_at")
                status = booking.get("status", "")

                # Apply date filters if provided
                if start_date:
                    try:
                        booking_date = datetime.fromisoformat(created_at)
                        start_dt = datetime.fromisoformat(start_date)
                        if booking_date < start_dt:
                            continue
                    except:
                        pass

                if end_date:
                    try:
                        booking_date = datetime.fromisoformat(created_at)
                        end_dt = datetime.fromisoformat(end_date)
                        if booking_date > end_dt:
                            continue
                    except:
                        pass

                # Count confirmed bookings
                if status == "active":
                    stats["total_confirmed"] += 1
                    try:
                        date_key = datetime.fromisoformat(created_at).strftime('%Y-%m-%d')
                        stats["confirmed_by_date"][date_key] = stats["confirmed_by_date"].get(date_key, 0) + 1
                    except:
                        pass

                # Count cancelled bookings
                if status == "cancelled" and cancelled_at:
                    stats["total_cancelled"] += 1
                    try:
                        date_key = datetime.fromisoformat(cancelled_at).strftime('%Y-%m-%d')
                        stats["cancelled_by_date"][date_key] = stats["cancelled_by_date"].get(date_key, 0) + 1
                    except:
                        pass

            return stats

        except Exception as e:
            logger.error(f"Error getting booking statistics: {e}")
            return {
                "total_confirmed": 0,
                "total_cancelled": 0,
                "confirmed_by_date": {},
                "cancelled_by_date": {}
            }

    def get_all_bookings(self, status: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all bookings with optional filters."""
        try:
            data = self._read_file()

            bookings = []
            for booking in data["bookings"]:
                # Apply status filter
                if status and booking.get("status") != status:
                    continue

                # Apply date filters
                if start_date:
                    try:
                        booking_date = datetime.fromisoformat(booking.get("created_at", ""))
                        start_dt = datetime.fromisoformat(start_date)
                        if booking_date < start_dt:
                            continue
                    except:
                        pass

                if end_date:
                    try:
                        booking_date = datetime.fromisoformat(booking.get("created_at", ""))
                        end_dt = datetime.fromisoformat(end_date)
                        if booking_date > end_dt:
                            continue
                    except:
                        pass

                bookings.append(booking)

            # Sort by date and time (most recent first)
            bookings.sort(key=lambda x: (x.get("date", ""), x.get("time", "")), reverse=True)

            return bookings

        except Exception as e:
            logger.error(f"Error getting all bookings: {e}")
            return []

    def update_booking(self, code: str, user_id: str, new_time: Optional[str] = None, new_date: Optional[str] = None) -> bool:
        """Update a booking's time or date."""
        try:
            data = self._read_file()

            for booking in data["bookings"]:
                if (booking["code"] == code and
                        booking["user_id"] == user_id and
                        booking["status"] == "active"):

                    if new_time:
                        booking["time"] = new_time
                    if new_date:
                        booking["date"] = new_date

                    booking["updated_at"] = datetime.now(BRASIL_TZ).isoformat()

                    self._write_file(data)
                    logger.info(f"Booking updated: {code}")
                    return True

            return False

        except Exception as e:
            logger.error(f"Error updating booking: {e}")
            return False

    def admin_cancel_booking(self, code: str) -> bool:
        """Admin cancels a booking without requiring user_id."""
        try:
            data = self._read_file()

            for booking in data["bookings"]:
                if booking["code"] == code and booking["status"] == "active":
                    booking["status"] = "cancelled"
                    booking["cancelled_at"] = datetime.now(BRASIL_TZ).isoformat()
                    booking["cancellation_reason"] = "Cancelado pelo administrador"

                    self._write_file(data)
                    logger.info(f"Booking cancelled by admin: {code}")
                    return True

            return False

        except Exception as e:
            logger.error(f"Error cancelling booking (admin): {e}")
            return False

# Global instance
booking_manager = BookingManager()
