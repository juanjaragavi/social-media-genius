/**
 * Static emoji dataset organized by category.
 * Using native Unicode emoji characters — no external API dependency.
 */

export interface EmojiItem {
  emoji: string;
  name: string;
  category: string;
}

export interface EmojiCategory {
  name: string;
  emojis: EmojiItem[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Caras y emociones",
    emojis: [
      { emoji: "😀", name: "Cara sonriente", category: "faces" },
      { emoji: "😃", name: "Cara con ojos grandes", category: "faces" },
      {
        emoji: "😄",
        name: "Cara sonriente con ojos entrecerrados",
        category: "faces",
      },
      { emoji: "😁", name: "Cara radiante", category: "faces" },
      { emoji: "😆", name: "Cara riendo", category: "faces" },
      { emoji: "😅", name: "Cara con gota de sudor", category: "faces" },
      { emoji: "🤣", name: "Revolcándose de risa", category: "faces" },
      { emoji: "😂", name: "Cara con lágrimas de alegría", category: "faces" },
      { emoji: "🙂", name: "Cara ligeramente sonriente", category: "faces" },
      { emoji: "😉", name: "Cara guiñando", category: "faces" },
      { emoji: "😊", name: "Cara sonrojada", category: "faces" },
      { emoji: "😍", name: "Cara con ojos de corazón", category: "faces" },
      { emoji: "🥰", name: "Cara sonriente con corazones", category: "faces" },
      { emoji: "😘", name: "Cara mandando beso", category: "faces" },
      { emoji: "😎", name: "Cara con gafas de sol", category: "faces" },
      { emoji: "🤩", name: "Cara con estrellas", category: "faces" },
      { emoji: "🥳", name: "Cara de fiesta", category: "faces" },
      { emoji: "😏", name: "Cara satisfecha", category: "faces" },
      { emoji: "🤔", name: "Cara pensando", category: "faces" },
      { emoji: "🤗", name: "Cara abrazando", category: "faces" },
      { emoji: "😢", name: "Cara llorando", category: "faces" },
      { emoji: "😭", name: "Cara llorando fuerte", category: "faces" },
      { emoji: "😱", name: "Cara gritando", category: "faces" },
      { emoji: "😡", name: "Cara enfadada", category: "faces" },
      { emoji: "🥺", name: "Cara suplicante", category: "faces" },
      { emoji: "😴", name: "Cara durmiendo", category: "faces" },
      { emoji: "🤯", name: "Cabeza explotando", category: "faces" },
      { emoji: "🫠", name: "Cara derritiéndose", category: "faces" },
    ],
  },
  {
    name: "Gestos y personas",
    emojis: [
      { emoji: "👍", name: "Pulgar arriba", category: "gestures" },
      { emoji: "👎", name: "Pulgar abajo", category: "gestures" },
      { emoji: "👏", name: "Manos aplaudiendo", category: "gestures" },
      { emoji: "🙌", name: "Manos celebrando", category: "gestures" },
      { emoji: "🤝", name: "Apretón de manos", category: "gestures" },
      { emoji: "✌️", name: "Victoria", category: "gestures" },
      { emoji: "🤞", name: "Dedos cruzados", category: "gestures" },
      { emoji: "💪", name: "Bíceps fuerte", category: "gestures" },
      { emoji: "🙏", name: "Manos juntas", category: "gestures" },
      { emoji: "👋", name: "Mano saludando", category: "gestures" },
      { emoji: "✋", name: "Mano levantada", category: "gestures" },
      { emoji: "🤙", name: "Llámame", category: "gestures" },
      { emoji: "👆", name: "Dedo señalando arriba", category: "gestures" },
      { emoji: "👇", name: "Dedo señalando abajo", category: "gestures" },
      { emoji: "👈", name: "Dedo señalando izquierda", category: "gestures" },
      { emoji: "👉", name: "Dedo señalando derecha", category: "gestures" },
    ],
  },
  {
    name: "Corazones y símbolos",
    emojis: [
      { emoji: "❤️", name: "Corazón rojo", category: "symbols" },
      { emoji: "🧡", name: "Corazón naranja", category: "symbols" },
      { emoji: "💛", name: "Corazón amarillo", category: "symbols" },
      { emoji: "💚", name: "Corazón verde", category: "symbols" },
      { emoji: "💙", name: "Corazón azul", category: "symbols" },
      { emoji: "💜", name: "Corazón púrpura", category: "symbols" },
      { emoji: "🖤", name: "Corazón negro", category: "symbols" },
      { emoji: "🤍", name: "Corazón blanco", category: "symbols" },
      { emoji: "💖", name: "Corazón brillante", category: "symbols" },
      { emoji: "💯", name: "Cien puntos", category: "symbols" },
      { emoji: "⭐", name: "Estrella", category: "symbols" },
      { emoji: "🌟", name: "Estrella brillante", category: "symbols" },
      { emoji: "✨", name: "Destellos", category: "symbols" },
      { emoji: "🔥", name: "Fuego", category: "symbols" },
      { emoji: "💥", name: "Explosión", category: "symbols" },
      { emoji: "⚡", name: "Rayo", category: "symbols" },
      { emoji: "🎯", name: "Diana", category: "symbols" },
      { emoji: "✅", name: "Marca de verificación", category: "symbols" },
      { emoji: "❌", name: "Cruz", category: "symbols" },
      { emoji: "⚠️", name: "Advertencia", category: "symbols" },
    ],
  },
  {
    name: "Negocios y tecnología",
    emojis: [
      { emoji: "💰", name: "Bolsa de dinero", category: "business" },
      { emoji: "💵", name: "Billete de dólar", category: "business" },
      { emoji: "💳", name: "Tarjeta de crédito", category: "business" },
      { emoji: "📈", name: "Gráfica subiendo", category: "business" },
      { emoji: "📉", name: "Gráfica bajando", category: "business" },
      { emoji: "📊", name: "Gráfico de barras", category: "business" },
      { emoji: "💼", name: "Maletín", category: "business" },
      { emoji: "📱", name: "Teléfono móvil", category: "business" },
      { emoji: "💻", name: "Computadora portátil", category: "business" },
      { emoji: "🖥️", name: "Computadora de escritorio", category: "business" },
      { emoji: "📧", name: "Email", category: "business" },
      { emoji: "🔔", name: "Campana", category: "business" },
      { emoji: "📣", name: "Megáfono", category: "business" },
      { emoji: "🎓", name: "Birrete de graduación", category: "business" },
      { emoji: "🏆", name: "Trofeo", category: "business" },
      { emoji: "🎖️", name: "Medalla militar", category: "business" },
      { emoji: "🚀", name: "Cohete", category: "business" },
      { emoji: "💡", name: "Bombilla", category: "business" },
      { emoji: "🔑", name: "Llave", category: "business" },
      { emoji: "🎉", name: "Confeti", category: "business" },
    ],
  },
  {
    name: "Naturaleza y clima",
    emojis: [
      { emoji: "☀️", name: "Sol", category: "nature" },
      { emoji: "🌈", name: "Arcoíris", category: "nature" },
      { emoji: "🌊", name: "Ola", category: "nature" },
      { emoji: "🌸", name: "Flor de cerezo", category: "nature" },
      { emoji: "🌺", name: "Hibisco", category: "nature" },
      { emoji: "🌻", name: "Girasol", category: "nature" },
      { emoji: "🍀", name: "Trébol de cuatro hojas", category: "nature" },
      { emoji: "🌿", name: "Hierba", category: "nature" },
      { emoji: "🌴", name: "Palmera", category: "nature" },
      { emoji: "🌙", name: "Luna creciente", category: "nature" },
      { emoji: "⛅", name: "Sol con nube", category: "nature" },
      { emoji: "❄️", name: "Copo de nieve", category: "nature" },
    ],
  },
  {
    name: "Comida y bebida",
    emojis: [
      { emoji: "☕", name: "Café", category: "food" },
      { emoji: "🍕", name: "Pizza", category: "food" },
      { emoji: "🍔", name: "Hamburguesa", category: "food" },
      { emoji: "🍩", name: "Dona", category: "food" },
      { emoji: "🎂", name: "Pastel de cumpleaños", category: "food" },
      { emoji: "🍷", name: "Copa de vino", category: "food" },
      { emoji: "🍺", name: "Cerveza", category: "food" },
      { emoji: "🥤", name: "Vaso con popote", category: "food" },
      { emoji: "🍎", name: "Manzana roja", category: "food" },
      { emoji: "🥑", name: "Aguacate", category: "food" },
      { emoji: "🍿", name: "Palomitas", category: "food" },
      { emoji: "🧁", name: "Cupcake", category: "food" },
    ],
  },
  {
    name: "Flechas y formas",
    emojis: [
      { emoji: "➡️", name: "Flecha derecha", category: "arrows" },
      { emoji: "⬅️", name: "Flecha izquierda", category: "arrows" },
      { emoji: "⬆️", name: "Flecha arriba", category: "arrows" },
      { emoji: "⬇️", name: "Flecha abajo", category: "arrows" },
      { emoji: "↗️", name: "Flecha diagonal arriba", category: "arrows" },
      { emoji: "↘️", name: "Flecha diagonal abajo", category: "arrows" },
      { emoji: "🔄", name: "Flechas en círculo", category: "arrows" },
      { emoji: "🔴", name: "Círculo rojo", category: "arrows" },
      { emoji: "🟢", name: "Círculo verde", category: "arrows" },
      { emoji: "🔵", name: "Círculo azul", category: "arrows" },
      { emoji: "🟡", name: "Círculo amarillo", category: "arrows" },
      { emoji: "⬛", name: "Cuadrado negro", category: "arrows" },
      { emoji: "⬜", name: "Cuadrado blanco", category: "arrows" },
      { emoji: "🔶", name: "Rombo naranja", category: "arrows" },
      { emoji: "🔷", name: "Rombo azul", category: "arrows" },
      { emoji: "▶️", name: "Botón de play", category: "arrows" },
    ],
  },
];

/**
 * Flat array of all emojis for searching.
 */
export const ALL_EMOJIS: EmojiItem[] = EMOJI_CATEGORIES.flatMap(
  (cat) => cat.emojis,
);

/**
 * Search emojis by name (case-insensitive, supports Spanish).
 */
export function searchEmojis(query: string): EmojiItem[] {
  if (!query.trim()) return ALL_EMOJIS;
  const lower = query.toLowerCase();
  return ALL_EMOJIS.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.emoji.includes(query) ||
      e.category.toLowerCase().includes(lower),
  );
}
