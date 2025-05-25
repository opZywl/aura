// src/aura/components/Companies.tsx

import React from 'react';

interface LogoItem {
    path: string;
    alt: string;
}

const logos: LogoItem[] = [
    { path: '/carrossel/Unasp.svg',                alt: 'Unasp' },
    { path: '/carrossel/ERA.svg',                  alt: 'ERA' },
    { path: '/carrossel/Pirelli.svg',              alt: 'Pirelli' },
    { path: '/carrossel/Desktop.svg',              alt: 'Desktop' },
    { path: '/carrossel/LinharesDistribuidora.svg',alt: 'Linhares Distribuidora' },
];

const Companies: React.FC = () => (
    <section id="companies" className="py-14">
        <div className="container mx-auto px-4 md:px-8">
            <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                O sucesso dos engenheiros e designers foi graças à passagem por lugares como
            </h3>

            <div className="relative mt-6 overflow-hidden">
                <div
                    className="flex flex-row animate-marquee gap-8"
                    style={
                        {
                            '--gap': '1rem',
                            '--duration': '40s',
                            width: '200%',
                        } as React.CSSProperties
                    }
                >
                    {/* sequência original */}
                    <div className="flex flex-row gap-8">
                        {logos.map(({ path, alt }) => (
                            <img
                                key={alt}
                                src={path}
                                alt={alt}
                                className="companies-logo h-10 w-28"
                            />
                        ))}
                    </div>

                    {/* duplicação para looping */}
                    <div className="flex flex-row gap-8">
                        {logos.map(({ path, alt }) => (
                            <img
                                key={`${alt}-dup`}
                                src={path}
                                alt={alt}
                                className="companies-logo h-10 w-28"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Companies;
