import React, { useState } from 'react';
import axios from 'axios';

// 3 Tracks with EXACTLY 15 Questions Each (Total 45 Qs)
const initialTracks = {
  devops: {
    title: '🛠️ DevOps & Infrastructure',
    questions: [
      { q: '1. Tool for Containerization?', opts: ['Docker', 'Git', 'Jenkins', 'Terraform'], ans: 0 },
      { q: '2. Tool for Container Orchestration?', opts: ['Ansible', 'Kubernetes', 'Nagios', 'Swarm'], ans: 1 },
      { q: '3. Save changes in Git locally?', opts: ['git push', 'git commit', 'git pull', 'git checkout'], ans: 1 },
      { q: '4. Default port for Flask server?', opts: ['8080', '5000', '3000', '5173'], ans: 1 },
      { q: '5. Continuous Integration (CI) tool?', opts: ['Jenkins', 'Docker', 'Prometheus', 'Grafana'], ans: 0 },
      { q: '6. Infrastructure as Code (IaC) tool?', opts: ['Terraform', 'Docker', 'Kubernetes', 'Postman'], ans: 0 },
      { q: '7. Command to clone a remote Git repo?', opts: ['git fetch', 'git clone', 'git init', 'git copy'], ans: 1 },
      { q: '8. Default port for Vite React server?', opts: ['5173', '3000', '5000', '8000'], ans: 0 },
      { q: '9. Monitoring tool for metrics & alerts?', opts: ['Prometheus', 'Docker', 'Vite', 'Nginx'], ans: 0 },
      { q: '10. Visualization tool for Prometheus metrics?', opts: ['Grafana', 'Jenkins', 'Git', 'Flask'], ans: 0 },
      { q: '11. Reverse proxy & web server?', opts: ['Nginx', 'Postman', 'Ansible', 'npm'], ans: 0 },
      { q: '12. Command to switch & create new Git branch?', opts: ['git checkout -b', 'git branch new', 'git init', 'git push'], ans: 0 },
      { q: '13. AWS serverless compute service?', opts: ['AWS Lambda', 'AWS S3', 'AWS EC2', 'AWS RDS'], ans: 0 },
      { q: '14. Configuration management with Playbooks?', opts: ['Ansible', 'Terraform', 'Docker', 'Vite'], ans: 0 },
      { q: '15. Linux command to print working directory?', opts: ['pwd', 'ls', 'cd', 'top'], ans: 0 }
    ]
  },
  cloud: {
    title: '☁️️ Cloud Engineering',
    questions: [
      { q: '1. Scalable Object Storage service in AWS?', opts: ['AWS S3', 'AWS EC2', 'AWS EBS', 'AWS RDS'], ans: 0 },
      { q: '2. Virtual server instance service in AWS?', opts: ['AWS EC2', 'AWS Lambda', 'AWS ECS', 'AWS VPC'], ans: 0 },
      { q: '3. Managed Relational Database in AWS?', opts: ['AWS RDS', 'DynamoDB', 'S3', 'ElastiCache'], ans: 0 },
      { q: '4. Managed Kubernetes service on AWS?', opts: ['AWS EKS', 'AWS ECS', 'Fargate', 'Lambda'], ans: 0 },
      { q: '5. GCP serverless container runner?', opts: ['Cloud Run', 'Compute Engine', 'BigQuery', 'Storage'], ans: 0 },
      { q: '6. Managed Kubernetes service on GCP?', opts: ['GKE', 'GCE', 'Cloud Run', 'App Engine'], ans: 0 },
      { q: '7. AWS DNS web service?', opts: ['Route 53', 'CloudFront', 'VPC', 'Direct Connect'], ans: 0 },
      { q: '8. Isolated virtual network in cloud?', opts: ['VPC', 'Subnet', 'NAT', 'VPN'], ans: 0 },
      { q: '9. AWS managed NoSQL key-value DB?', opts: ['DynamoDB', 'RDS', 'Redshift', 'Neptune'], ans: 0 },
      { q: '10. Auto-adjust compute capacity feature?', opts: ['Auto Scaling', 'Load Balancer', 'CDN', 'Backup'], ans: 0 },
      { q: '11. Global CDN service in AWS?', opts: ['CloudFront', 'S3', 'Route 53', 'API Gateway'], ans: 0 },
      { q: '12. What does IAM stand for?', opts: ['Identity and Access Management', 'Internal Access Manager', 'Integrated Access Model', 'Internet Audit Module'], ans: 0 },
      { q: '13. Multi-cloud IaC framework?', opts: ['Terraform', 'CloudFormation', 'ARM', 'Ansible'], ans: 0 },
      { q: '14. AWS serverless database engine?', opts: ['Aurora Serverless', 'EC2', 'EBS', 'S3'], ans: 0 },
      { q: '15. Security model dividing provider/client duties?', opts: ['Shared Responsibility Model', 'Zero Trust', 'IAM', 'MFA'], ans: 0 }
    ]
  },
  fullstack: {
    title: '💻 Full Stack Development',
    questions: [
      { q: '1. React hook to manage state?', opts: ['useState', 'useEffect', 'useContext', 'useRef'], ans: 0 },
      { q: '2. Node.js backend web framework?', opts: ['Express.js', 'Django', 'Spring Boot', 'Laravel'], ans: 0 },
      { q: '3. HTTP method to update resource?', opts: ['PUT', 'GET', 'POST', 'DELETE'], ans: 0 },
      { q: '4. Popular NoSQL document database?', opts: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite'], ans: 0 },
      { q: '5. React hook for side effects/fetching?', opts: ['useEffect', 'useState', 'useMemo', 'useCallback'], ans: 0 },
      { q: '6. Standard JSON authentication token?', opts: ['JWT', 'OAuth', 'API Key', 'Session ID'], ans: 0 },
      { q: '7. Utility-first CSS framework?', opts: ['Tailwind CSS', 'Bootstrap', 'Bulma', 'Foundation'], ans: 0 },
      { q: '8. Default package manager for Node.js?', opts: ['npm', 'yarn', 'pnpm', 'pip'], ans: 0 },
      { q: '9. JS runtime executing code outside browser?', opts: ['Node.js', 'Vite', 'Webpack', 'Babel'], ans: 0 },
      { q: '10. HTTP status code for resource creation?', opts: ['201 Created', '200 OK', '404 Not Found', '500 Server Error'], ans: 0 },
      { q: '11. Fast frontend build tool powered by Esbuild?', opts: ['Vite', 'CRA', 'Gulp', 'Grunt'], ans: 0 },
      { q: '12. Keyword for handling Promises cleanly?', opts: ['async / await', 'then / catch', 'try / catch', 'callback'], ans: 0 },
      { q: '13. Popular TypeScript/Node ORM?', opts: ['Prisma', 'Mongoose', 'Axios', 'Redux'], ans: 0 },
      { q: '14. UI Library created by Meta?', opts: ['React', 'Angular', 'Vue', 'Svelte'], ans: 0 },
      { q: '15. HTTP header used for auth tokens?', opts: ['Authorization', 'Content-Type', 'Accept', 'User-Agent'], ans: 0 }
    ]
  }
};

export default function App() {
  const [page, setPage] = useState('login');
  const [tracks, setTracks] = useState(initialTracks);
  const [user, setUser] = useState({ name: '', email: '', role: 'DevOps Aspirant' });
  const [adminPin, setAdminPin] = useState('');
  const [userLogs, setUserLogs] = useState([]);
  const [activeTrackKey, setActiveTrackKey] = useState('devops');
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Admin New Question Form State
  const [newQTrack, setNewQTrack] = useState('devops');
  const [newQText, setNewQText] = useState('');
  const [newOpts, setNewOpts] = useState(['', '', '', '']);
  const [newAns, setNewAns] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!user.name || !user.email) return;
    try { await axios.post('http://127.0.0.1:5000/api/login', user); } catch (err) {}
    if (user.role === 'Cloud Engineer') setActiveTrackKey('cloud');
    else if (user.role === 'Full Stack Developer') setActiveTrackKey('fullstack');
    else setActiveTrackKey('devops');
    setPage('dashboard');
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPin === '1234') { setPage('admin'); setAdminPin(''); } 
    else { alert('Invalid PIN! '); }
  };

  const handleStartQuiz = (trackKey) => {
    setActiveTrackKey(trackKey);
    setCurrentQ(0);
    setUserAnswers([]);
    setPage('quiz');
  };

  const handleSelectOption = (optIdx) => {
    const updated = [...userAnswers, optIdx];
    setUserAnswers(updated);
    if (currentQ + 1 < tracks[activeTrackKey].questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      const qList = tracks[activeTrackKey].questions;
      const score = updated.reduce((sc, sel, idx) => sel === qList[idx].ans ? sc + 1 : sc, 0);
      const pct = Math.round((score / qList.length) * 100);
      setUserLogs([{ name: user.name, email: user.email, track: tracks[activeTrackKey].title, score: `${score}/${qList.length}`, percentage: `${pct}%`, date: new Date().toLocaleTimeString() }, ...userLogs]);
      setPage('result');
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQText || newOpts.some(o => !o.trim())) { alert('Fill all fields!'); return; }
    const updatedTrack = { ...tracks[newQTrack] };
    updatedTrack.questions.push({ q: `${updatedTrack.questions.length + 1}. ${newQText}`, opts: [...newOpts], ans: parseInt(newAns) });
    setTracks({ ...tracks, [newQTrack]: updatedTrack });
    setNewQText(''); setNewOpts(['', '', '', '']);
    alert('Question added!');
  };

  const activeQuiz = tracks[activeTrackKey];
  const totalScore = userAnswers.reduce((sc, sel, idx) => sel === activeQuiz.questions[idx].ans ? sc + 1 : sc, 0);
  const percentage = Math.round((totalScore / activeQuiz.questions.length) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '540px', border: '1px solid #334155' }}>
        
        {/* LOGIN */}
        {page === 'login' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '20px' }}>Engineer Portal 🚀</h2>
              <button onClick={() => setPage('adminPass')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Admin Login 🔑</button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required type="text" placeholder="Full Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
              <input required type="email" placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
              <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}>
                <option value="DevOps Aspirant">DevOps Aspirant</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
              <button type="submit" style={{ padding: '12px', background: 'linear-gradient(90deg, #0284c7, #6366f1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Assessment 🚀</button>
            </form>
          </div>
        )}

        {/* ADMIN PIN */}
        {page === 'adminPass' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Admin Authentication 🔒</h3>
            <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required type="password" placeholder="Enter valid PIN " value={adminPin} onChange={(e) => setAdminPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
                <button type="button" onClick={() => setPage('login')} style={{ flex: 1, padding: '10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {page === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#f43f5e' }}>Admin Dashboard ⚙️</h3>
              <button onClick={() => setPage('login')} style={{ padding: '5px 10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Exit Admin</button>
            </div>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '13px' }}>➕ Add Question</h4>
              <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select value={newQTrack} onChange={(e) => setNewQTrack(e.target.value)} style={{ padding: '6px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569' }}>
                  <option value="devops">DevOps</option>
                  <option value="cloud">Cloud</option>
                  <option value="fullstack">Full Stack</option>
                </select>
                <input required type="text" placeholder="Question text" value={newQText} onChange={(e) => setNewQText(e.target.value)} style={{ padding: '6px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {newOpts.map((opt, i) => (
                    <input key={i} required type="text" placeholder={`Opt ${i+1}`} value={opt} onChange={(e) => { const u = [...newOpts]; u[i] = e.target.value; setNewOpts(u); }} style={{ padding: '6px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '11px' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <span>Correct Ans Index:</span>
                  <select value={newAns} onChange={(e) => setNewAns(e.target.value)} style={{ padding: '2px 6px', background: '#1e293b', color: '#fff' }}>
                    <option value={0}>1</option><option value={1}>2</option><option value={2}>3</option><option value={3}>4</option>
                  </select>
                </div>
                <button type="submit" style={{ padding: '6px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add Question</button>
              </form>
            </div>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '13px' }}>📊 Student Logs ({userLogs.length})</h4>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {userLogs.map((log, idx) => (
                  <div key={idx} style={{ background: '#1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{log.name}</strong> ({log.track})</span>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{log.score} ({log.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USER DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#38bdf8' }}>Welcome, {user.name}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.role}</span>
              </div>
              <button onClick={() => setPage('login')} style={{ padding: '5px 10px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px' }}>Logout</button>
            </div>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>Select Assessment Track (15 Questions Each):</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(tracks).map((key) => (
                <div key={key} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{tracks[key].title}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{tracks[key].questions.length} Questions</span>
                  </div>
                  <button onClick={() => handleStartQuiz(key)} style={{ padding: '6px 12px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Start</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE QUIZ */}
        {page === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#38bdf8', marginBottom: '10px' }}>
              <span>{activeQuiz.title}</span>
              <span>Q{currentQ + 1}/{activeQuiz.questions.length}</span>
            </div>
            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: '#f8fafc' }}>{activeQuiz.questions[currentQ].q}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeQuiz.questions[currentQ].opts.map((opt, idx) => (
                <button key={idx} onClick={() => handleSelectOption(idx)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {page === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#4ade80' }}>Quiz Completed! 🎉</h2>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '10px', margin: '15px 0' }}>
              <h1 style={{ margin: 0, color: '#38bdf8' }}>{totalScore} / {activeQuiz.questions.length}</h1>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: percentage >= 60 ? '#4ade80' : '#f87171' }}>{percentage}%</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPage('review')} style={{ flex: 1, padding: '10px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Review 🔍</button>
              <button onClick={() => setPage('dashboard')} style={{ flex: 1, padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Dashboard 📚</button>
            </div>
          </div>
        )}

        {/* REVIEW */}
        {page === 'review' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Answer Review 📋</h3>
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeQuiz.questions.map((item, qIdx) => {
                const userChoice = userAnswers[qIdx];
                const isCorrect = userChoice === item.ans;
                return (
                  <div key={qIdx} style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', border: `1px solid ${isCorrect ? '#166534' : '#991b1b'}` }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>{item.q}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: isCorrect ? '#4ade80' : '#f87171' }}>
                      Your: {item.opts[userChoice] ?? 'N/A'} {isCorrect ? '✓' : '✗'}
                    </p>
                    {!isCorrect && <p style={{ margin: 0, fontSize: '11px', color: '#4ade80' }}>Ans: {item.opts[item.ans]}</p>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setPage('dashboard')} style={{ width: '100%', padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px' }}>Back to Dashboard</button>
          </div>
        )}

      </div>
    </div>
  );
}
