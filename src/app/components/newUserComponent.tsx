import { useState } from 'react';
import { auth } from '@configuration/firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { createUser } from '@api/create-user';

const NewUserComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Administrador');
  const [phone, setPhone] = useState('');

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); 
  };

  const handleSave = async () => {
    const password = generateRandomPassword();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    //   await sendPasswordResetEmail(auth, email);

      console.log('User created successfully:', userCredential.user);

      const response = await createUser({
        nombre: name,
        email: email,
        rol: role,
        telefonoSolicita: phone,
      });

      if (response.status === 'success') {
        alert('User created successfully! An email has been sent to the user with account details.');
        window.location.reload(); 
      } else {
        console.error('Error saving user to Firestore:', response.message);
        alert('Failed to save user data: ' + response.message);
      }

    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-component rounded-lg shadow-lg">
      <h2 className="text-white text-lg font-semibold mb-4">Datos básicos</h2>

      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
          Nombre *
        </label>
        <input
          id="name"
          type="text"
          className="w-full p-2 text-black rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
          Email *
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-2 text-black rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="role">
          Rol
        </label>
        <select
          id="role"
          className="w-full p-2 text-black rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Administrador">Administrador</option>
          <option value="Usuario">Usuario</option>
          <option value="Caja chica">Caja chica</option>
          <option value="Auditor">Auditor</option>
          <option value="Abogados">Abogados</option>
          <option value="Asistente">Asistente</option>
          <option value="Solicitante de gastos">Solicitante de gastos</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2" htmlFor="phone">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          className="w-full p-2 text-black rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-4">
          <button
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            onClick={() => {
              alert('Go back functionality not implemented');
            }}
          >
            Volver
          </button>
          <button
            className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserComponent;
