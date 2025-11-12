import React, { useMemo, useState } from "react";

// Obtener la ruta base para GitHub Pages
const BASE_URL = import.meta.env.BASE_URL;

// --- UI helper ---
const Card = ({ title, children }) => (
  <div className="rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 bg-white">
    {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
    {children}
  </div>
);

// --- Utils ---
function shuffleArray(array) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// --- Components ---
const MultipleChoice = ({ q }) => {
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const shuf = useMemo(() => shuffleArray(q.options), [q.options]);

  const toggle = (k) => setSelected(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  const allCorrect = selected.length === q.correct.length && selected.every(k => q.correct.includes(k));

  return (
    <Card title={q.title}>
      {q.image && (
        <div className="mb-4">
          <img 
            src={`${BASE_URL}${q.image.startsWith('/') ? q.image.substring(1) : q.image}`}
            alt={`Imagen para ${q.title}`}
            className="w-full max-w-2xl mx-auto rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
      )}
      <p className="mb-3 text-sm md:text-base">{q.question}</p>
      <ul className="space-y-2">
        {shuf.map(o => (
          <li key={o.key}>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-black" checked={selected.includes(o.key)} onChange={() => toggle(o.key)} />
              <span>{o.text}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setChecked(true)} className="px-3 py-1.5 bg-black text-white rounded-lg text-sm">Verificar</button>
        <button onClick={() => { setSelected([]); setChecked(false); }} className="px-3 py-1.5 border rounded-lg text-sm">Reiniciar</button>
      </div>
      {checked && (
        <div className={`mt-3 p-3 rounded-xl text-sm ${allCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {allCorrect ? '✅ Correcto' : `❌ Incorrecto. Respuesta correcta: ${q.correct.map(k => q.options.find(o => o.key === k)?.text).join(', ')}`}
        </div>
      )}
    </Card>
  );
};

const MatchingBlock = ({ q }) => {
  const [answers, setAnswers] = useState({});
  const rightShuffled = useMemo(() => shuffleArray(q.right), [q.right]);
  const getText = (k) => q.right.find(r => r.key === k)?.text || '';

  const reset = () => {
    setAnswers({});
  };

  return (
    <Card title={q.title}>
      {q.image && (
        <div className="mb-4">
          <img 
            src={`${BASE_URL}${q.image.startsWith('/') ? q.image.substring(1) : q.image}`}
            alt={`Imagen para ${q.title}`}
            className="w-full max-w-2xl mx-auto rounded-lg border border-gray-300 shadow-sm"
          />
        </div>
      )}
      {q.question && <p className="mb-3 text-sm md:text-base">{q.question}</p>}
      <div className="divide-y">
        {q.left.map(l => {
          const chosen = answers[l.num];
          const correct = q.solution[l.num];
          const isCorrect = chosen === correct;
          return (
            <div key={l.num} className="py-3 grid md:grid-cols-2 gap-4 items-start">
              <div className="text-sm md:text-base font-medium">{l.num}. {l.text}</div>
              <div>
                <select value={chosen ?? ''} onChange={e => setAnswers({ ...answers, [l.num]: e.target.value })} className={`w-full border rounded-xl px-3 py-2 text-sm ${isCorrect ? 'border-green-500' : chosen && !isCorrect ? 'border-red-500' : ''}`}>
                  <option value="" disabled>Elige una opción…</option>
                  {rightShuffled.map(r => <option key={r.key} value={r.key}>{r.text}</option>)}
                </select>
                {chosen && (
                  <div className={`mt-2 text-xs md:text-sm rounded-xl p-3 ${isCorrect ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {isCorrect ? '✅ Correcto' : (<span>❌ Incorrecto. <b>Correcta:</b> {getText(correct)}</span>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <button onClick={reset} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
          Reiniciar
        </button>
      </div>
    </Card>
  );
};

const ImageMatching = ({ q }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const shuffledOptions = useMemo(() => shuffleArray(q.options), [q.options]);

  const handleSelect = (imageId, value) => {
    setAnswers({ ...answers, [imageId]: value });
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const reset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const allCorrect = q.images.every(img => answers[img.id] === img.correct);
  const allAnswered = q.images.every(img => answers[img.id]);

  return (
    <Card title={q.title}>
      <p className="mb-4 text-sm md:text-base">{q.question}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {q.images.map((img) => {
          const chosen = answers[img.id];
          const isCorrect = chosen === img.correct;
          const showFeedback = showResults && chosen;

          return (
            <div key={img.id} className={`border rounded-lg p-4 ${showFeedback ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300'}`}>
              <img 
                src={`${BASE_URL}${img.src.startsWith('/') ? img.src.substring(1) : img.src}`}
                alt={`Figura ${img.id}`}
                className="w-full rounded-lg shadow-sm mb-3"
              />
              <select 
                value={chosen ?? ''} 
                onChange={e => handleSelect(img.id, e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-sm mb-2 ${showFeedback ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`}
              >
                <option value="" disabled>Selecciona el tipo...</option>
                {shuffledOptions.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.text}</option>
                ))}
              </select>
              {showFeedback && (
                <div className={`text-xs md:text-sm p-2 rounded-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✅ Correcto' : `❌ Incorrecto. Correcta: ${q.options.find(o => o.key === img.correct)?.text}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={checkAnswers} 
          disabled={!allAnswered}
          className={`px-3 py-1.5 rounded-lg text-sm ${allAnswered ? 'bg-black text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Verificar
        </button>
        <button onClick={reset} className="px-3 py-1.5 border rounded-lg text-sm">
          Reiniciar
        </button>
      </div>
      {showResults && allAnswered && (
        <div className={`mt-3 p-3 rounded-xl text-sm ${allCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {allCorrect ? '✅ ¡Todas correctas!' : `❌ Algunas respuestas son incorrectas. Revisa las marcadas en rojo.`}
        </div>
      )}
    </Card>
  );
};

// --- DATA (1 a 16 en orden, mezclando tipos) ---
const elementos = [
  // 1
  {
    id: 1, 
    type: 'multiple', 
    title: '1) Opción múltiple', 
    question: 'Observar la figura y marcar la(s) alternativa(s) correcta(s):', 
    image: '/images/1.png',
    options: [
      { key: 'a', text: 'El proyecto dura 12 semanas.' },
      { key: 'b', text: 'El proyecto dura 10 semanas.' },
      { key: 'c', text: '20 es el mínimo de personas que se necesitan en una semana.' },
      { key: 'd', text: 'El proyecto dura 24 semanas.' },
      { key: 'e', text: '40 es el máximo de personas que se necesitan en una semana.' }
    ], 
    correct: ['a', 'e']
  },
  // 2
  {
    id: 2, 
    type: 'multiple', 
    title: '2) Opción múltiple', 
    question: 'Observar la figura y marcar la(s) alternativa(s) correcta(s):', 
    image: '/images/2.png',
    options: [
      { key: 'a', text: 'Todas las tareas tienen la misma duración.' },
      { key: 'b', text: 'Las tareas 1 y 2 se pueden realizar en paralelo.' },
      { key: 'c', text: 'La tarea 2 no puede comenzar si la tarea 1 no ha finalizado.' },
      { key: 'd', text: 'La fecha de comienzo de la tarea predecesora está dada por la fecha de término de la sucesora.' },
      { key: 'e', text: 'La dependencia entre la tarea 1 y 2 es Finish-to-Start.' }
    ], 
    correct: ['c', 'e']
  },
  // 3
  {
    id: 3, 
    type: 'multiple', 
    title: '3) Opción múltiple', 
    question: 'Observar la figura y marcar la(s) alternativa(s) correcta(s):', 
    image: '/images/3.png',
    options: [
      { key: 'a', text: 'Considerando la ruta crítica, la actividad crítica es Instalar sonido.' },
      { key: 'b', text: 'Ninguna de las demás' },
      { key: 'c', text: 'Considerando la ruta crítica, la actividad crítica es Instalar asientos' },
      { key: 'd', text: 'Considerando la ruta crítica, las tres actividades son críticas' },
      { key: 'e', text: 'Considerando la ruta crítica, la actividad crítica es Instalar luces' }
    ], 
    correct: ['a']
  },
  // 4
  {
    id: 4, 
    type: 'multiple', 
    title: '4) Opción múltiple', 
    question: 'Observar la figura y marcar la(s) alternativa(s) correcta(s):', 
    image: '/images/4.png',
    options: [
      { key: 'a', text: 'Hay dependencia obligatoria entre la tarea 2 y la tarea 3' },
      { key: 'b', text: 'Hay dependencia obligatoria entre la tarea 3 y la tarea 4.' },
      { key: 'c', text: 'Hay dependencia obligatoria entre la tarea 1 y la tarea 2.' },
      { key: 'd', text: 'Ninguna de las demás' },
      { key: 'e', text: 'Hay dependencia obligatoria entre la tarea 4 y la tarea 5' }
    ], 
    correct: ['b', 'c']
  },
  // 5 Matching Dependencias
  {
    id: 5, 
    type: 'matching', 
    title: '5) Coincidencia', 
    question: 'Relacione los Conceptos con las respectivas Aseveraciones:',
    left: [
      { num: '1', text: 'Dependencia Obligatoria' },
      { num: '2', text: 'Dependencia Discrecional' },
      { num: '3', text: 'Dependencia Externa' },
      { num: '4', text: 'Relación con Adelanto' },
      { num: '5', text: 'Relación de Retraso' },
      { num: '6', text: 'Holgura' },
      { num: '7', text: 'Ruta Crítica' }
    ], right: [
      { key: 'a', text: 'Alguna limitación física determina que necesariamente una actividad debe comenzar después de otra' },
      { key: 'b', text: 'La secuencia de las actividades la define el director del proyecto' },
      { key: 'c', text: 'Se relacionan actividades del proyecto con actividades que son ajenas a éste' },
      { key: 'd', text: 'Cuando la actividad sucesora comienza antes de que finalice su predecesora' },
      { key: 'e', text: 'Cuando la actividad sucesora comienza después de cierto tiempo desde que finaliza la actividad predecesora' },
      { key: 'f', text: 'Tiempo que se puede atrasar una actividad sin que se afecte la fecha de finalización del proyecto' },
      { key: 'g', text: 'Conjunto de actividades de mayor duración' }
    ], solution: { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g' }
  },
  // 6 - Observar las figuras (múltiples imágenes de dependencias)
  {
    id: 6, 
    type: 'image-matching',
    title: '6) Observar las figuras', 
    question: 'Observa cada figura y selecciona el tipo de dependencia que representa:', 
    images: [
      { id: 'img1', src: '/images/6_adelanto.png', correct: 'adelanto' },
      { id: 'img2', src: '/images/6_retraso.png', correct: 'retraso' },
      { id: 'img3', src: '/images/6_start-to-start.png', correct: 'start-start' },
      { id: 'img4', src: '/images/6_finish-to-finish.png', correct: 'finish-finish' },
      { id: 'img5', src: '/images/6_start-to-finish.png', correct: 'start-finish' }
    ],
    options: [
      { key: 'adelanto', text: 'Adelanto (Lead)' },
      { key: 'retraso', text: 'Retraso (Lag)' },
      { key: 'start-start', text: 'Start-to-Start (SS)' },
      { key: 'finish-finish', text: 'Finish-to-Finish (FF)' },
      { key: 'start-finish', text: 'Start-to-Finish (SF)' }
    ]
  },
  // 7 Matching Procesos de tiempo
  {
    id: 7, 
    type: 'matching', 
    title: '7) Coincidencia – Procesos de tiempo', 
    left: [
      { num: '1', text: 'Administrar Tiempos' },
      { num: '2', text: 'Definir Actividades' },
      { num: '3', text: 'Secuenciar Actividades' },
      { num: '4', text: 'Estimar Recursos' },
      { num: '5', text: 'Estimar Duraciones' },
      { num: '6', text: 'Programar' },
      { num: '7', text: 'Controlar Cambios' }
    ], right: [
      { key: 'a', text: 'Procesos necesarios para asegurar que el proyecto se cumpla dentro del tiempo preestablecido' },
      { key: 'b', text: 'Identificar y especificar actividades específicas para completar los entregables' },
      { key: 'c', text: 'Identificar la interactividad y dependencia entre las actividades' },
      { key: 'd', text: 'Definir los recursos necesarios para llevar a cabo las actividades' },
      { key: 'e', text: 'Estimar el tiempo necesario para completar las actividades individuales' },
      { key: 'f', text: 'Establecer principio y fin de cada actividad, analizando secuencia, duración y recursos' },
      { key: 'g', text: 'Actualizar los cambios que ocurren en la programación' }
    ], 
    solution: { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', '6': 'f', '7': 'g' }
  },
  // 8
  {
    id: 8, 
    type: 'multiple', 
    title: '8) Opción múltiple', 
    question: (
      <div>
        <p className="mb-3">Para seleccionar los mejores proyectos, ordene las siguientes aseveraciones:</p>
        <div className="space-y-2 mb-4 text-sm">
          <p>A.- Establecer los presupuestos y el cronograma de trabajo.</p>
          <p>B.- Analizar la viabilidad técnica, financiera, de gestión y legal de cada alternativa.</p>
          <p>C.- Identificar las alternativas de proyecto posibles.</p>
          <p>D.- Determinar la necesidad u oportunidad de cada proyecto.</p>
          <p>E.- Seleccionar los proyectos que resulten más importantes.</p>
          <p>F.- Excluir todos los proyectos inapropiados o inviables.</p>
          <p>G.- Lograr el compromiso de los interesados para seleccionar una alternativa.</p>
          <p>H.- Lograr el consenso de los interesados acerca de las características evaluadas.</p>
          <p>I.- Analizar los riesgos asociados a cada alternativa.</p>
        </div>
      </div>
    ), 
    options: [
      { key: 'a', text: 'D - C - A - B - H - I - G - F – E' },
      { key: 'b', text: 'C - D - A - B - I - H - G - F – E' },
      { key: 'c', text: 'B - D - A - E - G - I - H - C – F' },
      { key: 'd', text: 'E - F - A - B - G - I - H - C – D' },
      { key: 'e', text: 'E - F - B - A - G - I - D - C - H' }
    ], 
    correct: ['b']
  },
  // 9 Matching Gestión del Alcance
  {
    id: 9, 
    type: 'matching', 
    title: '9) Coincidencia – Gestión del Alcance', 
    question: 'En el contexto de la Gestión del Alcance, relacione lo siguiente:',
    left: [
      { num: '1', text: 'Definir, verificar y controlar el alcance del proyecto' },
      { num: '2', text: 'Crear la estructura de descomposición del trabajo' },
      { num: '3', text: 'Detallar el plan del proyecto' },
      { num: '4', text: 'Dividir el proyecto en componentes menores' },
      { num: '5', text: 'Dividir el proyecto en componentes más fáciles de manejar' },
      { num: '6', text: 'Formalizar la aceptación de los entregables del proyecto' },
      { num: '7', text: 'Controlar los cambios del proyecto' },
      { num: '8', text: 'Lo que se hará y lo que no se hará en el proyecto' }
    ], right: [
      { key: 'a', text: 'Planificación' },
      { key: 'b', text: 'Definición' },
      { key: 'c', text: 'Crear la EDT' },
      { key: 'd', text: 'Verificación' },
      { key: 'e', text: 'Control de Cambios' },
      { key: 'f', text: 'Alcance del Proyecto' }
    ], 
    solution: { '1': 'b', '2': 'c', '3': 'a', '4': 'c', '5': 'c', '6': 'd', '7': 'e', '8': 'f' }
  },
  // 10 Matching Objetivos del proyecto
  {
    id: 10, 
    type: 'matching', 
    title: '10) Coincidencia – Objetivos del proyecto', 
    question: 'En el contexto de los objetivos del proyecto, relacione lo siguiente:',
    left: [
      { num: '1', text: 'Cualquier Stakeholder debe comprenderlos sin mayores inconvenientes' },
      { num: '2', text: 'Deben ser consecuentes con las restricciones de tiempo, alcance, recursos y calidad' },
      { num: '3', text: 'Definidos con fechas de inicio y término' },
      { num: '4', text: 'Facilidad en su valoración para poder verificar el éxito en el cumplimiento del proyecto' },
      { num: '5', text: 'El director del proyecto debe comprenderlos sin mayores inconvenientes' },
      { num: '6', text: 'Considerar el contexto en que nos encontramos y las herramientas con las que contamos' }
    ], right: [
      { key: 'a', text: 'Claridad' },
      { key: 'b', text: 'Realista' },
      { key: 'c', text: 'Temporal' },
      { key: 'd', text: 'Medible' }
    ], 
    solution: { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'a', '6': 'b' }
  },
  // 11
  {
    id: 11, 
    type: 'multiple', 
    title: '11) Opción múltiple', 
    question: 'Marcar los criterios para seleccionar los mejores proyectos:', 
    options: [
      { key: 'a', text: 'Las características técnicas del producto.' },
      { key: 'b', text: 'Políticas organizacionales.' },
      { key: 'c', text: 'Todos los necesarios para determinar los beneficios del producto.' },
      { key: 'd', text: 'La rentabilidad financiera del proyecto.' },
      { key: 'e', text: 'Factores de riesgo asociados a cada alternativa.' },
      { key: 'f', text: 'Identificar las restricciones legales.' },
      { key: 'g', text: 'Analizar la viabilidad de la gestión para evaluar si es posible adecuar los RR.HH.' }
    ], 
    correct: ['a', 'c', 'd', 'e', 'f', 'g']
  },
  // 12 Matching EDT y documentos base
  {
    id: 12, 
    type: 'matching', 
    title: '12) Coincidencia – EDT y documentos base', 
    question: 'Relacione la aseveración con el respectivo concepto:',
    left: [
      { num: '1', text: 'Divide al proyecto en menores entregables más fáciles de manejar' },
      { num: '2', text: 'Demasiados niveles de descomposición de la EDT podrían implicar un proyecto' },
      { num: '3', text: 'Partidas de nivel más bajo de cualquier rama de una EDT es' },
      { num: '4', text: 'Donde se incluye una breve descripción del producto o servicio que se implementará con el proyecto' },
      { num: '5', text: 'Donde se justifica la necesidad de implementar el proyecto' }
    ], right: [
      { key: 'a', text: 'EDT' },
      { key: 'b', text: 'Inmanejable' },
      { key: 'c', text: 'Paquetes de trabajo' },
      { key: 'd', text: 'Acta de Constitución' }
    ], 
    solution: { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'd' }
  },
  // 13 - Elegir alternativa de proyecto
  {
    id: 13, 
    type: 'multiple', 
    title: '13) Opción múltiple', 
    question: 'Elegir la alternativa(s) de proyecto para implementar un sistema:', 
    image: '/images/13.png',
    options: [
      { key: 'a', text: 'Proyecto "A" o "B"' },
      { key: 'b', text: 'Ninguna de demás' },
      { key: 'c', text: 'Proyecto "B"' },
      { key: 'd', text: 'Proyecto "C"' },
      { key: 'e', text: 'Proyecto "A"' },
      { key: 'f', text: 'Proyecto "B" o "C"' }
    ], 
    correct: ['e']
  },
  // 14 Matching Alcances y acta
  {
    id: 14, 
    type: 'matching', 
    title: '14) Coincidencia – Alcances y acta', 
    question: 'Relacione la aseveración con el respectivo concepto:',
    left: [
      { num: '1', text: 'El propósito es autorizar el uso de recursos de la organización para comenzar las tareas' },
      { num: '2', text: 'Sirve como autorización formal para comenzar el proyecto' },
      { num: '3', text: 'Corresponde a las características y funciones del sistema que se habrá de producir' },
      { num: '4', text: 'Se logra cuando el software cumple con los requerimientos específicos' },
      { num: '5', text: 'Un alcance del producto podría ser un componente de él' },
      { num: '6', text: 'Trabajo necesario para lograr el objetivo del proyecto' }
    ], right: [
      { key: 'a', text: 'Acta de Constitución' },
      { key: 'b', text: 'Alcance del Producto' },
      { key: 'c', text: 'Alcance del Proyecto' }
    ], 
    solution: { '1': 'a', '2': 'a', '3': 'b', '4': 'b', '5': 'c', '6': 'c' }
  },
  // 15 Matching Causas de proyectos
  {
    id: 15, 
    type: 'matching', 
    title: '15) Coincidencia – Causas que originan proyectos', 
    question: 'En el contexto de las causas que originan los proyectos, relacione lo siguiente:',
    left: [
      { num: '1', text: 'Se crean nuevos procesadores para satisfacer las crecientes necesidades de los clientes' },
      { num: '2', text: 'El área TI planifica un proyecto web solicitado por el directorio de la empresa' },
      { num: '3', text: 'Duoc crea una carrera 100% On-Line, aprovechando la mejora en la conectividad a Internet en el país' },
      { num: '4', text: 'Un proyecto tecnológico se ve obligado a utilizar la ley 19799 (Sobre documentos electrónicos, firma electrónica y servicios de certificación de dicha firma)' },
      { num: '5', text: 'Una empresa con fines filantrópicos crea una aplicación Mobile para apoyar la entrega de medicamentos a personas de la tercera edad' }
    ], right: [
      { key: 'a', text: 'Demanda' },
      { key: 'b', text: 'Cambio Tecnológico' },
      { key: 'c', text: 'Requerimiento Legal' },
      { key: 'd', text: 'Necesidad Social' }
    ], 
    solution: { '1': 'a', '2': 'a', '3': 'b', '4': 'c', '5': 'd' }
  },
  // 16 Opción múltiple - Elementos básicos
  {
    id: 16, 
    type: 'multiple', 
    title: '16) Opción múltiple', 
    question: (
      <div>
        <p className="mb-3">Ordene los elementos básicos que se deben cubrir al iniciar un proyecto:</p>
        <div className="space-y-2 mb-4 text-sm">
          <p>A.- Detalle de los bienes y los servicios que se deberán producir para lograr los objetivos.</p>
          <p>B.- Plan que permite identificar el FODA para conocer como alcanzar con éxito los objetivos.</p>
          <p>C.- Resultados que se esperan en un proyecto.</p>
          <p>D.- Brecha con obstáculos entre el momento inicial y el momento final donde se quiere estar.</p>
          <p>E.- Bases para alcanzar los objetivos y las metas del proyecto.</p>
        </div>
      </div>
    ),
    options: [
      { key: 'a', text: 'D - B - E - A – C' },
      { key: 'b', text: 'A - B - C - D – E' },
      { key: 'c', text: 'C - A - B - D - E' },
      { key: 'd', text: 'D - E - A - B - C' },
      { key: 'e', text: 'C - A - B - E - D' },
      { key: 'f', text: 'D - E - C - A – B' }
    ], 
    correct: ['f']
  }
];

// --- PAGE ---
export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Página de Estudio – Gestión de Proyectos</h1>
      <p className="text-gray-700 mb-6">Selecciona las respuestas correctas para cada pregunta o relación. Las opciones se mezclan automáticamente y las coincidencias se validan al instante.</p>
      {elementos.map(item => {
        if (item.type === 'multiple') {
          return <MultipleChoice key={item.id} q={item} />;
        } else if (item.type === 'image-matching') {
          return <ImageMatching key={item.id} q={item} />;
        } else {
          return <MatchingBlock key={item.id} q={item} />;
        }
      })}
    </div>
  );
}
