import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../Functions/CreateClient";

const ProfileConfiguration = () => {
  const [profile, setProfile] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    avatar_url: null,
  });
  const [userId, setUserId] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error(
          "se presentaron los siguientes errores para obtener el ID",
          userError
        );
        return;
      }
      setUserId(user?.id); //Guardamos el ID de usuario en la constante
    };
    fetchUserId;
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  //Funcion para cargar datos del perfil
  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarPreview(data.avatar_url);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Manejar seleccion de imagen
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //Validar tipo y tamaño de imagen
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imagenes JPG, PNG o GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      //5MB MAXIMO
      alert("la imagen no debe superar 5 Megabytes");
      return;
    }

    //Generar nombre de archivo unico
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      //Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars") //Bucket en Supabase llamado avatars
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      //Obtener URL publica de la imagen
      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (urlError) throw urlError;

      //Actualizar perfil con nueva URL de avatar
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      //Actualizar estado local
      setProfile(prev => ({
        ...prev,
        avatar_url:publicUrl
      }))
      setAvatarPreview(publicUrl)
    } catch (error) {
        console.error("Error subiendo avatar:", error)
        alert("No se pudo subir la imagen");
    }
  };

  //Guardamos cambios en perfil
  const saveProfileChanges = async () => {
    try {
        const { error } = await supabase
        .from("profiles")
        .update({
            correo: profile.correo,
            telefono: profile.telefono
        })
        .eq("id", userId)

        if(error) throw error
        alert("Perfil actualizado correctamente")
    } catch (error) {
        console.error("Error al momento de actualizar:", error);
        alert("No se pudieron guardar los cambios")
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-md mt-20">
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center mb-6 relative">
                <input type="file"
                id="avatarUpload"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange} />
            
                <label htmlFor="avatarUpload"
                className="cursor-pointer"
                >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover" />
                    ): (
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                            <Camera className="text-gray-500" size={48} />
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2">
                    <Camera size={20}/>
                    </div>
                </label>
            </div>

            {/* Campos de Perfil */}
            <div className="space-y-4">
                
                {/* Nombre no editable del usuario  */}
                <label htmlFor="" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text"
            value={profile.name}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed" />
            </div>

            <div className="space-y-4">
                {/* Cargo del usuario  */}
                <label htmlFor="" className="block text-sm font-medium text-gray-700">Cargo</label>
            <input type="text"
            value={profile.cargo}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed" />
            </div>
            {/* Email Editable */}
        
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-gray-700">
                            Correo Electronico
                        </label>
                        <input type="email" 
                        name="email"
                        value={profile.correo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                        />
                    </div>

                    {/* Telefono Editable */}
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-gray-700">
                            Telefono
                        </label>
                        <input type="tel" 
                        name="telefono"
                        value={profile.telefono}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                        />
                    </div>

                    {/* Distribucion no editable */}
                    <div>
                        <label htmlFor="" className="block text-sm font-medium text-gray-700">
                            Distribucion
                        </label>
                        <input type="text" 
                        name="text"
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                        />
                    </div>

                    {/* Boton de guardar */}
                    <div className="mt-6">
                        <button onClick={saveProfileChanges} 
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                       Guardar Cambios
                        </button>
                    </div>

        </div>
    </div>
  )
};

export default ProfileConfiguration;
