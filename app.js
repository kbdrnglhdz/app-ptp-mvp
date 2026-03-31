const { useState, useEffect } = React;

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Trabajo',
    priority: 'Media',
    dueDate: ''
  });

  // Datos de respaldo para cuando se abre como archivo local (CORS fallback)
  const initialData = [
    { id: 1, title: "Configuración del Entorno", description: "Asegurar que todas las herramientas funcionen correctamente.", category: "Trabajo", priority: "Alta", status: "Completado", dueDate: "2024-03-31", comments: [] },
    { id: 2, title: "Diseño de la Interfaz", description: "Refinar los estilos de CSS para que el planificador luzca premium y moderno.", category: "Diseño", priority: "Alta", status: "En Progreso", dueDate: "2024-04-01", comments: [] },
    { id: 3, title: "Mock de Datos", description: "Vincular el archivo .json con la aplicación React de forma asíncrona.", category: "Desarrollo", priority: "Media", status: "Pendiente", dueDate: "2024-04-02", comments: [] }
  ];

  useEffect(() => {
    const savedTasks = localStorage.getItem('planner_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      setLoading(false);
    } else {
      fetch('./data.json')
        .then(res => res.json())
        .then(data => {
          setTasks(data.tasks);
          setLoading(false);
        })
        .catch(err => {
          console.warn("Fetch local bloqueado (CORS). Usando fallback.");
          setTasks(initialData);
          setLoading(false);
        });
    }
  }, []);

  // Guardar cambios en LocalStorage para simular persistencia
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('planner_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    const taskObj = {
      ...newTask,
      id: Date.now(),
      status: 'Pendiente',
      comments: []
    };
    
    setTasks([taskObj, ...tasks]);
    setNewTask({ title: '', description: '', category: 'Trabajo', priority: 'Media', dueDate: '' });
    setShowForm(false);
  };

  const addComment = (taskId, text) => {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(),
      text,
      date: new Date().toLocaleString()
    };
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
    ));
  };

  const updateComment = (taskId, commentId, newText) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? {
        ...t,
        comments: t.comments.map(c => 
          c.id === commentId ? { ...c, text: newText, date: new Date().toLocaleString() + ' (editado)' } : c
        )
      } : t
    ));
  };

  const deleteComment = (taskId, commentId) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, comments: t.comments.filter(c => c.id !== commentId) } : t
    ));
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'Completado' ? 'Pendiente' : 'Completado' } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = filter === 'Todas' 
    ? tasks 
    : tasks.filter(t => t.category === filter || t.status === filter);

  if (loading) return <div className="loading">Cargando Planificador...</div>;

  return (
    <div className="app-container">
      <header>
        <h1>Planificador Maestro</h1>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tareas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{tasks.filter(t => t.status === 'Completado').length}</span>
            <span className="stat-label">Completadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{tasks.filter(t => t.priority === 'Alta').length}</span>
            <span className="stat-label">Prioridad Alta</span>
          </div>
        </div>
      </header>

      <div className="controls">
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Cerrar' : '✚ Nueva Tarea'}
        </button>
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="Todas">Mostrar: Todas</option>
          <option value="Trabajo">Categoría: Trabajo</option>
          <option value="Personal">Categoría: Personal</option>
          <option value="Diseño">Categoría: Diseño</option>
          <option value="Completado">Estado: Completado</option>
          <option value="Pendiente">Estado: Pendiente</option>
        </select>
      </div>

      {showForm && (
        <form className="task-card" onSubmit={addTask} style={{marginTop: '1rem'}}>
          <h3>Registrar Nueva Tarea</h3>
          <input 
            type="text" placeholder="Título de la tarea..." 
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            required
          />
          <textarea 
            placeholder="Descripción detallada..." 
            value={newTask.description}
            onChange={e => setNewTask({...newTask, description: e.target.value})}
          />
          <div style={{display: 'flex', gap: '1rem'}}>
            <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}>
              <option value="Trabajo">Trabajo</option>
              <option value="Personal">Personal</option>
              <option value="Diseño">Diseño</option>
              <option value="Desarrollo">Desarrollo</option>
            </select>
            <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
              <option value="Baja">Prioridad: Baja</option>
              <option value="Media">Prioridad: Media</option>
              <option value="Alta">Prioridad: Alta</option>
            </select>
          </div>
          <input 
            type="date" 
            value={newTask.dueDate}
            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
          />
          <button type="submit" className="add-btn" style={{marginTop: '1rem'}}>Crear Tarea</button>
        </form>
      )}

      <main className="dashboard-grid">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
            <div className="task-meta">
              <span className="category-tag">{task.category}</span>
              <span style={{color: task.priority === 'Alta' ? '#ef4444' : '#94a3b8'}}>{task.priority}</span>
            </div>
            <h2 className="task-title" style={{textDecoration: task.status === 'Completado' ? 'line-through' : 'none', opacity: task.status === 'Completado' ? 0.6 : 1}}>
              {task.title}
            </h2>
            <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>{task.description}</p>
            <div className="task-meta" style={{marginTop: 'auto'}}>
              <span>📅 {task.dueDate || 'Sin fecha'}</span>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  style={{background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer'}}
                >
                  {task.status === 'Completado' ? 'Reabrir' : 'Hecho'}
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer'}}
                >
                  Borrar
                </button>
              </div>
            </div>

            {/* Sección de Comentarios */}
            <div className="comments-section">
              <div className="comments-title">
                💬 Comentarios ({(task.comments || []).length})
              </div>
              
              <div className="comment-list">
                {(task.comments || []).map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onUpdate={(newText) => updateComment(task.id, comment.id, newText)}
                    onDelete={() => deleteComment(task.id, comment.id)}
                  />
                ))}
              </div>

              <AddCommentForm onAdd={(text) => addComment(task.id, text)} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

const CommentItem = ({ comment, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const handleUpdate = () => {
    onUpdate(editText);
    setIsEditing(false);
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span>🕒 {comment.date}</span>
      </div>
      {isEditing ? (
        <div>
          <textarea 
            className="comment-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="comment-actions">
            <button className="comment-btn" onClick={handleUpdate}>Guardar</button>
            <button className="comment-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div className="comment-text">{comment.text}</div>
          <div className="comment-actions">
            <button className="comment-btn" onClick={() => setIsEditing(true)}>Editar</button>
            <button className="comment-btn delete-comment-btn" onClick={onDelete}>Eliminar</button>
          </div>
        </>
      )}
    </div>
  );
};

const AddCommentForm = ({ onAdd }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <form className="add-comment-form" onSubmit={handleSubmit}>
      <input 
        type="text" 
        className="comment-input" 
        placeholder="Escribe un comentario..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="send-comment-btn">
        ➤
      </button>
    </form>
  );
};

// Renderizado de la App
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />); 
