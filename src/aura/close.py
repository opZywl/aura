"""
close_services.py

Script para encerrar o backend Flask (porta 3001), frontend React (porta 3000) e processos ngrok.
Uso: python close_services.py
"""
import psutil
import os
import signal

# Configurações: portas e nomes de processos
PORTS_TO_CLOSE = [3000, 3001]
PROCESS_NAMES = ['ngrok']

def kill_process(pid):
    try:
        proc = psutil.Process(pid)
        proc_name = proc.name()
        print(f"Encerrando PID {pid} ({proc_name})")
        proc.terminate()
    except Exception as e:
        print(f"Erro ao encerrar PID {pid}: {e}")

def find_and_kill_by_port(port):
    for conn in psutil.net_connections(kind='tcp'):
        if conn.laddr and conn.laddr.port == port:
            pid = conn.pid
            if pid:
                kill_process(pid)

def find_and_kill_by_name(name):
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if name.lower() in proc.info['name'].lower() or \
                    any(name.lower() in cmd.lower() for cmd in proc.info['cmdline'] or []):
                kill_process(proc.info['pid'])
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

if __name__ == '__main__':
    print("Iniciando encerramento de serviços...")
    # Fecha processos que escutam nas portas definidas
    for port in PORTS_TO_CLOSE:
        print(f"Procurando processos na porta {port}...")
        find_and_kill_by_port(port)

    # Fecha processos por nome
    for name in PROCESS_NAMES:
        print(f"Procurando processos com nome '{name}'...")
        find_and_kill_by_name(name)

    print("Encerramento concluído.")
