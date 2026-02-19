/**
 * Internationalization (i18n) System
 *
 * Supports three output locales: EN (English), ES (Spanish), BR (Portuguese Brazil)
 * UI remains in Spanish per TopNetworks standards.
 * Output language affects generated content language.
 */

export type OutputLocale = "EN" | "ES" | "BR";

export interface LocaleConfig {
  code: OutputLocale;
  label: string;
  flag: string;
  nativeName: string;
  geminiLanguageInstruction: string;
}

export const LOCALES: Record<OutputLocale, LocaleConfig> = {
  EN: {
    code: "EN",
    label: "Inglés",
    flag: "🇺🇸",
    nativeName: "English",
    geminiLanguageInstruction:
      "Generate ALL content (text, hashtags, image prompts) in English.",
  },
  ES: {
    code: "ES",
    label: "Español",
    flag: "🇪🇸",
    nativeName: "Español",
    geminiLanguageInstruction:
      "Genera TODO el contenido (texto, hashtags, prompts de imagen) en Español.",
  },
  BR: {
    code: "BR",
    label: "Portugués (Brasil)",
    flag: "🇧🇷",
    nativeName: "Português (Brasil)",
    geminiLanguageInstruction:
      "Gere TODO o conteúdo (texto, hashtags, prompts de imagem) em Português do Brasil.",
  },
};

/** UI translations — the app UI is always in Spanish */
export const UI_LABELS = {
  // Generator form
  generateBanner: "Generar Banner",
  generatingBanner: "Generando Banner...",
  platform: "Plataforma",
  topic: "Tema",
  topicPlaceholder: "ej., Lanzamiento de producto, Promoción de verano...",
  postType: "Tipo de Publicación",
  tone: "Tono",
  contentLength: "Longitud del Contenido",
  includeHashtags: "Incluir hashtags",
  generateImage: "Generar imagen con IA",
  imageStyle: "Estilo de Imagen",
  additionalInstructions: "Instrucciones Adicionales",
  additionalInstructionsHint: "Cualquier requisito o guía específica...",
  outputLanguage: "Idioma del Contenido",
  bannerDimensions: "Dimensiones del Banner",
  aspectRatio: "Relación de Aspecto",
  resolution: "Resolución",

  // Campaign
  campaignMode: "Modo Campaña",
  campaignDescription: "Genera banners en 3 dimensiones diferentes a la vez",
  primaryDimension: "Dimensión Principal",
  secondaryDimension: "Dimensión Secundaria",
  tertiaryDimension: "Dimensión Terciaria",
  createCampaign: "Crear Campaña",
  creatingCampaign: "Creando Campaña...",

  // Results
  generatedBanner: "Banner Generado",
  content: "Contenido",
  hashtags: "Hashtags",
  imagePrompt: "Prompt de Imagen",
  videoPrompt: "Prompt de Video",
  downloadImage: "Descargar Imagen",
  copyContent: "Copiar Contenido",
  copyHashtags: "Copiar Hashtags",
  copyImagePrompt: "Copiar Prompt",
  copied: "¡Copiado!",
  editInEditor: "Editar en Editor Visual",
  print: "Imprimir",

  // Editor
  editorTitle: "Editor Visual",
  layers: "Capas",
  addText: "Agregar Texto",
  addImage: "Agregar Imagen",
  addShape: "Agregar Forma",
  addWatermark: "Agregar Marca de Agua",
  deleteElement: "Eliminar",
  duplicateElement: "Duplicar",
  bringForward: "Traer al Frente",
  sendBackward: "Enviar Atrás",
  aiEdit: "Editar con IA",
  aiEditPlaceholder: "Describe los cambios que deseas...",
  applyAiEdit: "Aplicar Cambios",
  exportImage: "Exportar Imagen",
  fontSize: "Tamaño",
  fontFamily: "Fuente",
  fontColor: "Color",
  bold: "Negrita",
  italic: "Itálica",
  underline: "Subrayado",
  alignment: "Alineación",
  opacity: "Opacidad",
  rotation: "Rotación",
  position: "Posición",
  size: "Tamaño",
  watermarkPosition: "Posición de Marca",
  watermarkScale: "Escala de Marca",

  // Metadata
  engagement: "Engagement",
  contentType: "Tipo de Contenido",
  generationTime: "Tiempo de Generación",
  estimatedCost: "Costo Estimado",
  tokensUsed: "tokens utilizados",

  // Features
  superFast: "Súper Rápido",
  superFastDesc:
    "Genera banners fotorrealistas optimizados por plataforma en segundos con Gemini 2.5 Flash",
  platformSpecific: "Específico por Plataforma",
  platformSpecificDesc:
    "Contenido personalizado para Instagram, Twitter, Facebook, TikTok y LinkedIn",
  mediaGeneration: "Generación de Medios",
  mediaGenerationDesc:
    "Banners fotorrealistas con Imagen 4.0 Ultra e integración de editor visual",

  // Status
  bannerWillAppearHere: "Tu banner aparecerá aquí",
  optimizedContent: "Contenido optimizado por plataforma",
  trendingHashtags: "Etiquetas en tendencia",
  aiVisuals: "Visuales fotorrealistas generados con IA",
  lowCost: "Bajo Costo",
  lowCostDesc: "~$0.0002 por publicación",

  // Watermark positions
  watermarkPositions: {
    "top-left": "Superior Izquierda",
    "top-center": "Superior Centro",
    "top-right": "Superior Derecha",
    center: "Centro",
    "bottom-left": "Inferior Izquierda",
    "bottom-center": "Inferior Centro",
    "bottom-right": "Inferior Derecha",
  } as Record<string, string>,

  // Post type labels
  postTypeLabels: {
    promotional: "Promocional",
    educational: "Educativo",
    entertaining: "Entretenido",
    news: "Noticias",
    announcement: "Anuncio",
    "behind-the-scenes": "Detrás de Cámaras",
    "user-generated": "Contenido de Usuario",
    poll: "Encuesta",
    question: "Pregunta",
  } as Record<string, string>,

  // Tone labels
  toneLabels: {
    casual: "Casual",
    professional: "Profesional",
    friendly: "Amigable",
    urgent: "Urgente",
    inspiring: "Inspirador",
    humorous: "Humorístico",
    empathetic: "Empático",
    authoritative: "Con Autoridad",
  } as Record<string, string>,

  // Content length labels
  contentLengthLabels: {
    short: "Corto",
    medium: "Medio",
    long: "Largo",
  } as Record<string, string>,

  // Image style labels
  imageStyleLabels: {
    "product-photo": "Foto de Producto",
    lifestyle: "Estilo de Vida",
    infographic: "Infografía",
    illustration: "Ilustración",
    minimalist: "Minimalista",
    vibrant: "Vibrante",
    professional: "Profesional",
    candid: "Espontáneo",
  } as Record<string, string>,
};

export function getLocaleConfig(locale: OutputLocale): LocaleConfig {
  return LOCALES[locale];
}

export function getAllLocales(): LocaleConfig[] {
  return Object.values(LOCALES);
}
