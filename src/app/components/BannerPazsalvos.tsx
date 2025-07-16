import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Pazsalvo1 from '@public/images/pazsalvo1.svg';
import Pazsalvo2 from '@public/images/pazsalvo2.svg';
import Pazsalvo3 from '@public/images/pazsalvo3.svg';


const opciones = [
    {
        image: Pazsalvo1
    },
    {
        image: Pazsalvo2
    },
    {
        image: Pazsalvo3
    }
];

export default function BannerPazsalvos() {
    const [index, setIndex] = useState(0);

    const nextSlide = () => {
        setIndex((prev) => (prev + 1) % opciones.length);
    };

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + opciones.length) % opciones.length);
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-white text-2xl font-bold mb-4 text-center">
                ¿Qué puedes solicitar en este trámite?
            </h2>

            {/* Vista escritorio */}
            <div className="hidden md:flex justify-center gap-4">
                {opciones.map((opcion, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className={`${opcion.image
                            ? ''
                            : 'border-2 border-purple-500 rounded-2xl p-4 shadow-xl bg-[#1E1E2D] text-white flex items-center justify-center'
                            }`}
                    >
                        {opcion.image ? (
                            <Image
                                src={opcion.image}
                                alt="En este trámite te ayudaremos de la siguiente forma:"
                                width={500}
                                height={500}
                               className="mx-auto w-full max-w-[350px] h-auto rounded-lg shadow-lg"
                            />
                        ) : (
                            <>
                                {/* <h3 className="text-lg font-bold mb-2 text-purple-400">{opcion.titulo}</h3>
                                <p className="text-sm text-gray-300 text-justify">{opcion.descripcion}</p> */}
                            </>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Vista móvil */}
            <div className="md:hidden relative w-full mt-4">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className={`${opciones[index].image
                        ? ''
                        : 'border-2 border-purple-500 rounded-2xl p-4 shadow-xl bg-[#1E1E2D] text-white flex items-center justify-center'
                        }`}
                >
                    {opciones[index].image ? (
                        <Image
                            src={opciones[index].image}
                            alt="En este trámite te ayudaremos de la siguiente forma:"
                            width={500}
                            height={300}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    ) : (
                        <>
                            {/* <h3 className="text-lg font-bold mb-2 text-purple-400">{opciones[index].titulo}</h3>
                            <p className="text-sm text-gray-300 text-justify">{opciones[index].descripcion}</p> */}
                        </>
                    )}
                </motion.div>

                <div className="absolute inset-y-1/2 left-[-10px] flex items-center">
                    <button
                        onClick={prevSlide}
                        className="bg-profile p-2 rounded-full shadow text-white"
                    >
                        <ChevronLeft />
                    </button>
                </div>

                <div className="absolute inset-y-1/2 right-[-10px] flex items-center">
                    <button
                        onClick={nextSlide}
                        className="bg-profile p-2 rounded-full shadow text-white"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}
