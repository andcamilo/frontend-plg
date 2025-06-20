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
    const noMostrarBoton = preguntasHref === "/NoMostrarBoton";

    // Calcular cantidad total de botones
    const totalBotones = (noMostrarBoton ? 0 : 1) + 1 + (mostrarPreguntas ? 1 : 0) + 1;
    const usarGrid = totalBotones > 2;

    return (
        <div
            className={
                usarGrid
                    ? `grid grid-cols-1 md:grid-cols-${mostrarPreguntas ? '4' : '3'} gap-4 mt-8 text-center`
                    : `flex justify-center gap-4 mt-8`
            }
        >
            {!noMostrarBoton && (
                <Link
                    href={primerHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center w-full max-w-[200px] mx-auto"
                >
                    {primerTexto}
                </Link>
            )}

            <Link
                href="/request/consulta-propuesta"
                className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center w-full max-w-[200px] mx-auto"
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
                    className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center w-full max-w-[200px] mx-auto"
                >
                    Preguntas Frecuentes
                </Link>
            )}

            <Link
                href="/contacts"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center w-full max-w-[200px] mx-auto"
            >
                Contáctanos
            </Link>
        </div>
    );
}
