"use client";  // Make sure it's a client component
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "@configuration/firebase";
import cookie from "js-cookie";
import Image from "next/image";

const ROLES: Record<number, string> = {
  99: "Super Admin",
  90: "Administrador",
  80: "Auditor",
  50: "Caja Chica",
  40: "Abogados",
  35: "Asistente",
  17: "Cliente Recurrente",
  10: "Cliente",
};

const ProfileButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const router = useRouter(); // ✅ FIXED: Now works in App Router
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setEmail(firebaseUser.email);
        try {
          const db = getFirestore();
          const q = query(collection(db, "usuarios"), where("email", "==", firebaseUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            setRole(data.rol || null);
            setProfilePhoto(data.fotoPerfil || null);
          } else {
            setRole(null);
            setProfilePhoto(null);
          }

        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setEmail(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      cookie.remove("AuthToken");
      router.push("/login"); // ✅ FIXED: Works in Next.js 13+
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = email ? email.split("@")[0].slice(0, 2).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 focus:outline-none overflow-hidden"
      >
        {profilePhoto ? (
          <img src={profilePhoto} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1F1F2E] rounded-md shadow-lg z-10">
          <div className="py-1">
            <p className="px-4 py-2 text-sm text-white truncate">{email ?? "Sin usuario"}</p>
            <p className="px-4 py-2 text-sm text-white truncate">
              {role != null ? ROLES[role] : "Sin rol"}
            </p>
            <hr className="my-1" />
            {profilePhoto && (
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-black"
              >
                Ver Foto de Perfil
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/account")}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-black"
            >
              Mi cuenta
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-sm w-full relative">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
            >
              ✕
            </button>

            {profilePhoto ? (
              <Image
                src={profilePhoto}
                alt="Foto de perfil"
                width={300}
                height={300}
                className="w-full h-auto rounded-lg object-cover"
              />
            ) : (
              <p className="text-center text-gray-500">No hay foto de perfil disponible.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileButton;
