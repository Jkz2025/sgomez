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
    distribuidor: "",
    avatar_url: null,
  });
  const [userId, setUserId] = useState(null);
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
          const { data: publicUrlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(data.avatar_url);
          avatarUrl = publicUrlData.publicUrl;
        }

        setProfile({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
          cargo: data.cargo || "",
          distribuidor: data.distribuidor || "",
          avatar_url: data.avatar_url || null
        });
        
        if (avatarUrl) {
          setAvatarPreview(avatarUrl);
        }
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

    // Crear URL temporal para previsualización
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Primero eliminamos la imagen anterior si existe
      if (profile.avatar_url) {
        await supabase.storage
          .from("avatars")
          .remove([profile.avatar_url]);
      }

      // Subimos la nueva imagen
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const { data: publicUrlData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Actualizar el perfil con la ruta del archivo
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Actualizar estados locales
      setProfile(prev => ({
        ...prev,
        avatar_url: filePath
      }));
      
    } catch (error) {
      console.error("Error subiendo avatar:", error);
      alert("No se pudo subir la imagen");
      // Limpiar la previsualización en caso de error
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const saveProfileChanges = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          correo: profile.correo,
          telefono: profile.telefono,
          avatar_url: profile.avatar_url
        })
        .eq("id", userId);

      if (error) throw error;
      alert("Perfil actualizado correctamente");
      // Recargar los datos del perfil después de guardar
      fetchProfileData(userId);
    } catch (error) {
      console.error("Error al momento de actualizar:", error);
      alert("No se pudieron guardar los cambios");
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
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover"
                onError={() => {
                  console.error("Error loading image");
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

        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Distribución
            </label>
            <input
              type="text"
              value={profile.distribuidor}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

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