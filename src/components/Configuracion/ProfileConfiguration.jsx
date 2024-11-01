import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../Functions/CreateClient";

const ProfileConfiguration = () => {
  const [profile, setProfile] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    cargo: "",
    distribucion: "",
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
      if (user?.id) {
        setUserId(user.id);
        fetchProfileData(user.id);
      }
    };
    fetchUserId();
  }, []);

  const fetchProfileData = async (id) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // Obtener la URL pública de la imagen si existe
        let avatarUrl = null;
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.avatar_url.split('/').pop());
          avatarUrl = publicUrl;
        }

        setProfile({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
          cargo: data.cargo || "",
          distribucion: data.distribucion || "",
          avatar_url: avatarUrl
        });
        setAvatarPreview(avatarUrl);
      }
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Solo se permiten imagenes JPG, PNG o GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("la imagen no debe superar 5 Megabytes");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Primero eliminamos la imagen anterior si existe
      if (profile.avatar_url) {
        const oldFilePath = profile.avatar_url.split('/').pop();
        await supabase.storage
          .from("avatars")
          .remove([oldFilePath]);
      }

      // Subimos la nueva imagen
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Actualizar el perfil con la ruta del archivo
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath }) // Guardamos la ruta relativa
        .eq("id", userId);

      if (updateError) throw updateError;

      // Actualizar estados locales con la URL pública
      setProfile(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));
      setAvatarPreview(publicUrl);
      
    } catch (error) {
      console.error("Error subiendo avatar:", error);
      alert("No se pudo subir la imagen");
    }
  };

  const saveProfileChanges = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          correo: profile.correo,
          telefono: profile.telefono
        })
        .eq("id", userId);

      if (error) throw error;
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al momento de actualizar:", error);
      alert("No se pudieron guardar los cambios");
    }
  };

  // Función para comprobar si una URL es válida
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-md mt-20">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center mb-6 relative">
          <input
            type="file"
            id="avatarUpload"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <label htmlFor="avatarUpload" className="cursor-pointer">
            {avatarPreview && isValidUrl(avatarPreview) ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover"
                onError={(e) => {
                  console.error("Error loading image:", e);
                  setAvatarPreview(null);
                }}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <Camera className="text-gray-500" size={48} />
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2">
              <Camera size={20} />
            </div>
          </label>
        </div>

        {/* El resto del código del return permanece igual */}
        <div className="space-y-4">
          {/* Nombre completo no editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={`${profile.nombre} ${profile.apellido}`}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Cargo no editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cargo
            </label>
            <input
              type="text"
              value={profile.cargo}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Email editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={profile.correo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Teléfono editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={profile.telefono}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Distribución no editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Distribución
            </label>
            <input
              type="text"
              value={profile.distribucion}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Botón de guardar */}
          <div className="mt-6">
            <button
              onClick={saveProfileChanges}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileConfiguration;