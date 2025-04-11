import Link from 'next/link';

interface BotonesPreguntasYContactosProps {
    primerTexto: React.ReactNode;
    primerHref: string;
    preguntasHref: string;
}

export default function BotonesPreguntasYContactos({
    primerTexto,
    primerHref,
    preguntasHref,
}: BotonesPreguntasYContactosProps) {
    const mostrarPreguntas = preguntasHref === "/faqs-sociedades";

    return (
        <div className={`grid grid-cols-1 md:grid-cols-${mostrarPreguntas ? '4' : '3'} gap-4 mt-8 text-center`}>
            <Link
                href={primerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center"
            >
                {primerTexto}
            </Link>

            <Link
                href="/request/consulta-propuesta"
                className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center"
            >
                Solicitar Propuesta
                <br />
                o Consulta Legal
            </Link>

            {mostrarPreguntas && (
                <Link
                    href={preguntasHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center"
                >
                    Preguntas Frecuentes
                </Link>
            )}

            <Link
                href="/contacts"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center"
            >
                Contáctanos
            </Link>
        </div>
    );
}
