// openaiService.js
import OpenAI from 'openai';
import { supabase } from './CreateClient';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ---------- FUNCIONES DE CONSULTA Y MODIFICACIÓN ----------

// Obtener el usuario autenticado (reutilizable)
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuario no autenticado');
  return user;
};

// 1. Contar citas totales (con filtros opcionales)
const getCitas = async ({ estado, fecha_desde, fecha_hasta }) => {
  try {
    const user = await getCurrentUser();
    let query = supabase
      .from('visitas')
      .select('*', { count: 'exact', head: true })
      .eq('asesor', user.id);

    if (estado) query = query.eq('estado', estado);
    if (fecha_desde) query = query.gte('fecha', fecha_desde);
    if (fecha_hasta) query = query.lte('fecha', fecha_hasta);

    const { count, error } = await query;
    if (error) throw error;
    return { count: count || 0 };
  } catch (error) {
    return { error: error.message };
  }
};

// 2. Listar programas (con filtro por mes/año)
const getProgramas = async ({ mes, anio }) => {
  try {
    const user = await getCurrentUser();
    let query = supabase
      .from('programas')
      .select('*')
      .eq('asesor', user.id);

    if (mes && anio) {
      // Filtro por mes y año (asumiendo columna 'fecha' tipo date)
      const start = `${anio}-${String(mes).padStart(2, '0')}-01`;
      const end = `${anio}-${String(mes).padStart(2, '0')}-31`;
      query = query.gte('fecha', start).lte('fecha', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { programas: data || [], count: data?.length || 0 };
  } catch (error) {
    return { error: error.message };
  }
};

// 3. Contar clientes
const getClientes = async () => {
  try {
    const user = await getCurrentUser();
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('asesor_id', user.id);
    if (error) throw error;
    return { count: count || 0 };
  } catch (error) {
    return { error: error.message };
  }
};

// 4. Agendar una nueva cita (insertar en visitas)
const agendarCita = async ({ nombre_cliente, telefono, direccion, fecha, hora, notas = '' }) => {
  try {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('visitas')
      .insert([
        {
          asesor: user.id,
          cliente: nombre_cliente,
          telefono,
          direccion,
          fecha,
          hora,
          notas,
          estado: 'pendiente',
        },
      ])
      .select();
    if (error) throw error;
    return { success: true, cita: data[0] };
  } catch (error) {
    return { error: error.message };
  }
};

// 5. Crear un nuevo programa de referidos
const crearPrograma = async ({ cliente_principal, telefono, direccion, fecha, regalo, distribucion }) => {
  try {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('programas')
      .insert([
        {
          asesor: user.id,
          cliente: cliente_principal,
          telefono,
          direccion,
          fecha,
          regalo,
          distribucion,
        },
      ])
      .select();
    if (error) throw error;
    return { success: true, programa: data[0] };
  } catch (error) {
    return { error: error.message };
  }
};

// ---------- DEFINICIÓN DE FUNCIONES PARA OPENAI ----------

const functions = [
  {
    name: 'getCitas',
    description: 'Obtiene el número de citas del asesor, opcionalmente filtradas por estado y rango de fechas.',
    parameters: {
      type: 'object',
      properties: {
        estado: { type: 'string', enum: ['pendiente', 'realizada', 'cancelada'], description: 'Filtrar por estado' },
        fecha_desde: { type: 'string', format: 'date', description: 'Fecha mínima (YYYY-MM-DD)' },
        fecha_hasta: { type: 'string', format: 'date', description: 'Fecha máxima (YYYY-MM-DD)' },
      },
      required: [],
    },
  },
  {
    name: 'getProgramas',
    description: 'Obtiene la lista de programas del asesor, opcionalmente filtrados por mes y año. Devuelve también el total.',
    parameters: {
      type: 'object',
      properties: {
        mes: { type: 'integer', minimum: 1, maximum: 12, description: 'Mes (1-12)' },
        anio: { type: 'integer', description: 'Año (ej. 2025)' },
      },
      required: [],
    },
  },
  {
    name: 'getClientes',
    description: 'Obtiene el número total de clientes registrados por el asesor.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'agendarCita',
    description: 'Agenda una nueva cita para el asesor en la base de datos.',
    parameters: {
      type: 'object',
      properties: {
        nombre_cliente: { type: 'string', description: 'Nombre completo del cliente' },
        telefono: { type: 'string', description: 'Teléfono de contacto' },
        direccion: { type: 'string', description: 'Dirección donde se realizará la cita' },
        fecha: { type: 'string', format: 'date', description: 'Fecha de la cita (YYYY-MM-DD)' },
        hora: { type: 'string', description: 'Hora de la cita (HH:MM)' },
        notas: { type: 'string', description: 'Notas adicionales (opcional)' },
      },
      required: ['nombre_cliente', 'telefono', 'direccion', 'fecha', 'hora'],
    },
  },
  {
    name: 'crearPrograma',
    description: 'Crea un nuevo programa de referidos en la base de datos.',
    parameters: {
      type: 'object',
      properties: {
        cliente_principal: { type: 'string', description: 'Nombre del cliente principal' },
        telefono: { type: 'string', description: 'Teléfono de contacto' },
        direccion: { type: 'string', description: 'Dirección' },
        fecha: { type: 'string', format: 'date', description: 'Fecha del programa' },
        regalo: { type: 'string', description: 'Regalo ofrecido' },
        distribucion: { type: 'string', description: 'Tipo de distribución (ej. "casa", "oficina")' },
      },
      required: ['cliente_principal', 'telefono', 'direccion', 'fecha', 'regalo'],
    },
  },
];

// ---------- EJECUTOR DE FUNCIONES ----------

const executeFunction = async (functionName, args) => {
  switch (functionName) {
    case 'getCitas':
      return await getCitas(args);
    case 'getProgramas':
      return await getProgramas(args);
    case 'getClientes':
      return await getClientes();
    case 'agendarCita':
      return await agendarCita(args);
    case 'crearPrograma':
      return await crearPrograma(args);
    default:
      return { error: `Función '${functionName}' no reconocida` };
  }
};

// ---------- FUNCIÓN PRINCIPAL PARA ENVIAR MENSAJES ----------

export const sendMessageToAI = async (messages) => {
  try {
    // Mensaje de sistema que describe el contexto y capacidades
    const systemMessage = {
      role: 'system',
      content: `Eres un asistente útil para asesores de Royal Prestige Cali. 
      Tienes acceso a la base de datos del asesor autenticado. 
      Puedes consultar y modificar datos usando las funciones disponibles.
      - Para saber el número de citas, usa getCitas (puedes filtrar por estado o fecha).
      - Para listar programas, usa getProgramas (puedes filtrar por mes/año).
      - Para contar clientes, usa getClientes.
      - Para agendar una cita, usa agendarCita (requiere nombre, teléfono, dirección, fecha, hora).
      - Para crear un programa, usa crearPrograma.
      Siempre que sea posible, proporciona datos concretos y claros. 
      Si el usuario pide información sin especificar filtros, usa valores predeterminados (ej. mes actual). 
      Sé amable, profesional y conciso.`,
    };

    // Primera llamada a la API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      functions: functions,
      function_call: 'auto',
      max_tokens: 600,
      temperature: 0.7,
    });

    const responseMessage = response.choices[0].message;

    // Si la IA quiere llamar a una función
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      // Ejecutar la función
      const result = await executeFunction(functionName, functionArgs);

      // Enviar el resultado de vuelta a la IA para obtener la respuesta final
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          systemMessage,
          ...messages,
          responseMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(result),
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      return secondResponse.choices[0].message.content;
    }

    // Si no llama a función, devolver la respuesta directa
    return responseMessage.content;
  } catch (error) {
    console.error('Error en sendMessageToAI:', error);
    // Lanzamos el error para que el componente lo maneje
    throw new Error(error.message || 'Error al procesar la solicitud');
  }
};