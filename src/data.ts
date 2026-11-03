export type Grade = '11-1' | '11-2' | '11-3';
export type Category = 'general' | 'tecnologico';
export type Status = 'published' | 'draft';
export type AdminSection = 'dashboard' | 'upload' | 'manage' | 'drive';

export interface TeamMember {
  role: string;
  name: string;
}

export interface Section {
  title: string;
  content: string;
  image?: string;
}

export interface Newspaper {
  id: string;
  title: string;
  subtitle: string;
  grade: Grade;
  category: Category;
  date: string;
  coverImage: string;
  status: Status;
  excerpt: string;
  team: TeamMember[];
  sections: Section[];
  views: number;
  edition: number;
  pages: number;
}

export const newspapers: Newspaper[] = [
  {
    id: 'tech-001',
    title: 'TechLab News',
    subtitle: 'Inteligencia Artificial en la Educación',
    grade: '11-1',
    category: 'tecnologico',
    date: '2024-11-15',
    coverImage:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Exploramos cómo la inteligencia artificial está transformando las aulas y qué significa para nuestra generación de estudiantes.',
    views: 342,
    edition: 3,
    pages: 8,
    team: [
      { role: 'Editor', name: 'Sebastián Rojas' },
      { role: 'Diseñador', name: 'Laura Fernández' },
      { role: 'Redactor', name: 'Andrés Gómez' },
      { role: 'Redactor', name: 'Valeria Torres' },
    ],
    sections: [
      {
        title: 'IA: ¿Aliada o amenaza en el aula?',
        content:
          'La inteligencia artificial ha llegado a nuestras vidas de una manera que pocos imaginaban hace apenas una década. Herramientas como ChatGPT, Gemini y Copilot están cambiando la forma en que los estudiantes investigan, escriben y aprenden. En el Área de Informática de nuestro colegio, hemos comenzado a explorar estas tecnologías de manera crítica y responsable, entendiendo tanto sus enormes posibilidades como sus limitaciones éticas.',
        image:
          'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Conversión de archivos: PDF, Word y PowerPoint',
        content:
          'Una de las habilidades más útiles en el mundo digital es saber convertir archivos entre diferentes formatos. En este especial, aprendemos a transformar documentos PDF a Word, presentaciones PowerPoint a PDF, y mucho más. Herramientas como Adobe Acrobat, LibreOffice y servicios en línea como Smallpdf, ILovePDF y Convertio nos facilitan estas tareas cotidianas sin necesidad de software especializado.',
        image:
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Fuentes y recomendaciones',
        content:
          'Para profundizar en los temas tratados en esta edición, recomendamos explorar Google for Education, Microsoft Learn y Khan Academy. Estas plataformas ofrecen cursos gratuitos y certificaciones que pueden enriquecer tu perfil profesional desde temprana edad.',
      },
    ],
  },
  {
    id: 'tech-002',
    title: 'Bit a Bit',
    subtitle: 'Ciberseguridad para Jóvenes',
    grade: '11-2',
    category: 'tecnologico',
    date: '2024-09-20',
    coverImage:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Guía esencial para proteger tu identidad digital y navegar de forma segura en la era de las ciberamenazas.',
    views: 218,
    edition: 2,
    pages: 6,
    team: [
      { role: 'Editor', name: 'Camila Soto' },
      { role: 'Diseñador', name: 'Miguel Ángel Vargas' },
      { role: 'Redactor', name: 'Isabella Moreno' },
      { role: 'Redactor', name: 'Thomas Bernal' },
    ],
    sections: [
      {
        title: 'Contraseñas seguras: tu primera línea de defensa',
        content:
          'En un mundo donde manejamos decenas de cuentas digitales, tener contraseñas seguras es fundamental. Una contraseña robusta debe tener al menos 12 caracteres, combinar mayúsculas, minúsculas, números y símbolos especiales. El uso de gestores de contraseñas como Bitwarden o 1Password puede simplificar enormemente esta tarea.',
        image:
          'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Reconociendo el phishing y las estafas en línea',
        content:
          'El phishing es una técnica de engaño utilizada por ciberdelincuentes para robar información personal. Aprende a identificar correos sospechosos, enlaces falsos y páginas web fraudulentas. Recuerda: ningún banco ni entidad oficial te pedirá tu contraseña por correo electrónico.',
      },
    ],
  },
  {
    id: 'tech-003',
    title: 'Código Abierto',
    subtitle: 'Introducción al Desarrollo Web',
    grade: '11-3',
    category: 'tecnologico',
    date: '2024-10-08',
    coverImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Todo lo que necesitas saber para dar tus primeros pasos en HTML, CSS y JavaScript desde cero.',
    views: 189,
    edition: 1,
    pages: 10,
    team: [
      { role: 'Editor', name: 'Daniel Herrera' },
      { role: 'Diseñador', name: 'Sofía Ramírez' },
      { role: 'Redactor', name: 'Juan Pablo Castro' },
      { role: 'Redactor', name: 'Ana María López' },
    ],
    sections: [
      {
        title: 'HTML: La estructura de la web',
        content:
          'HTML (HyperText Markup Language) es el lenguaje de marcado que estructura el contenido de las páginas web. Con etiquetas semánticas organizamos la información de manera clara y accesible. En este artículo exploramos los conceptos básicos y te mostramos cómo crear tu primera página web en menos de una hora.',
        image:
          'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'CSS: Dando estilo a tu visión',
        content:
          'CSS (Cascading Style Sheets) es el lenguaje que da vida visual a las páginas HTML. Colores, tipografías, espaciados y layouts son controlados por CSS. Con el auge de frameworks como Tailwind CSS y Bootstrap, el diseño web moderno se ha vuelto más accesible que nunca para los desarrolladores principiantes.',
      },
    ],
  },
  {
    id: 'gen-001',
    title: 'El Eco Estudiantil',
    subtitle: 'Edición Cultural y Artística',
    grade: '11-1',
    category: 'general',
    date: '2024-10-25',
    coverImage:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Celebramos la diversidad cultural de nuestra comunidad estudiantil con una edición especial dedicada al arte y la expresión.',
    views: 156,
    edition: 5,
    pages: 8,
    team: [
      { role: 'Editor', name: 'María José Pérez' },
      { role: 'Diseñador', name: 'Carlos Jiménez' },
      { role: 'Redactor', name: 'Lucía Martínez' },
    ],
    sections: [
      {
        title: 'Festival Cultural: Una semana de celebración',
        content:
          'La semana cultural 2024 fue un evento lleno de color, música, danza y gastronomía. Estudiantes de todos los grados participaron con entusiasmo en representaciones artísticas que reflejaron la riqueza cultural de nuestra región. El grado 11-1 presentó una obra de teatro que conmovió a toda la comunidad educativa.',
        image:
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Talentos estudiantiles que brillan',
        content:
          'Este año descubrimos grandes talentos en nuestros salones. Pintores, músicos, poetas y bailarines encontraron en el festival el espacio perfecto para expresarse. Destacamos especialmente el proyecto de murales que ahora embellecen los corredores de nuestra institución educativa.',
      },
    ],
  },
  {
    id: 'gen-002',
    title: 'Voces del Colegio',
    subtitle: 'Edición Deportiva',
    grade: '11-2',
    category: 'general',
    date: '2024-11-03',
    coverImage:
      'https://images.unsplash.com/photo-1547347298-4074ad3086f0?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Cobertura completa de los Juegos Intercolegiados y el campeonato interno de fútbol y baloncesto 2024.',
    views: 203,
    edition: 4,
    pages: 6,
    team: [
      { role: 'Editor', name: 'Felipe González' },
      { role: 'Diseñador', name: 'Natalia Díaz' },
      { role: 'Redactor', name: 'Esteban Ruiz' },
      { role: 'Redactor', name: 'Paola Suárez' },
    ],
    sections: [
      {
        title: 'Campeones intercolegiados de fútbol',
        content:
          'Con un emotivo partido final que terminó 3-2, el equipo de fútbol se coronó campeón de los Juegos Intercolegiados 2024. El gol de la victoria llegó en los últimos minutos del partido, desatando la euforia de estudiantes, profesores y padres de familia presentes en las tribunas.',
        image:
          'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Baloncesto: Plata en el torneo regional',
        content:
          'El equipo femenino de baloncesto tuvo una actuación brillante en el torneo regional, alcanzando la final y conquistando la medalla de plata. Su disciplina, compañerismo y entrega son un ejemplo para toda la comunidad estudiantil.',
      },
    ],
  },
  {
    id: 'gen-003',
    title: 'Mundo Escolar',
    subtitle: 'Edición Ambiental',
    grade: '11-3',
    category: 'general',
    date: '2024-08-30',
    coverImage:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop&auto=format',
    status: 'published',
    excerpt:
      'Reportaje especial sobre las iniciativas ambientales lideradas por los estudiantes del grado once.',
    views: 134,
    edition: 2,
    pages: 7,
    team: [
      { role: 'Editor', name: 'Sara Ospina' },
      { role: 'Diseñador', name: 'Julián Cárdenas' },
      { role: 'Redactor', name: 'Alejandra Muñoz' },
    ],
    sections: [
      {
        title: 'Huerta escolar: De semilla a cosecha',
        content:
          'El proyecto de huerta escolar del grado 11-3 ha transformado un espacio abandonado en un jardín productivo. Con el apoyo del área de Ciencias Naturales, los estudiantes aprendieron técnicas de agricultura orgánica, compostaje y manejo sostenible del agua.',
        image:
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop&auto=format',
      },
      {
        title: 'Reciclaje y conciencia ambiental',
        content:
          'A través de jornadas de reciclaje y campañas de sensibilización, el grado 11-3 ha logrado reducir significativamente los residuos generados en la institución. La campaña "Cero plástico" ha sido adoptada por toda la comunidad educativa como un compromiso colectivo.',
      },
    ],
  },
];
