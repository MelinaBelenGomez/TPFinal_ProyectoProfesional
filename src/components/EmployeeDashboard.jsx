import { useState, useEffect } from 'react';

const EmployeeDashboard = ({ user }) => {
  const [timeRecords, setTimeRecords] = useState([
    { date: '2025-01-15', checkIn: '08:00', checkOut: '17:00', hours: 9 },
    { date: '2025-01-14', checkIn: '08:15', checkOut: '17:30', hours: 9.25 },
    { date: '2025-01-13', checkIn: '07:55', checkOut: '16:45', hours: 8.83 },
    { date: '2025-01-12', checkIn: '08:10', checkOut: '17:15', hours: 9.08 }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    alert(`Entrada registrada a las ${timeString}`);
    setIsCheckedIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    alert(`Salida registrada a las ${timeString}`);
    setIsCheckedIn(false);
  };

  const totalHours = timeRecords.reduce((sum, record) => sum + record.hours, 0);

  return (
    <div className="employee-dashboard">
      <div className="welcome-card card">
        <h2>Bienvenido, {user.username}</h2>
        <p>Hora actual: {currentTime.toLocaleString('es-ES')}</p>
        <div className="time-actions">
          {!isCheckedIn ? (
            <button onClick={handleCheckIn} className="check-in-btn">
              <i className="fas fa-sign-in-alt"></i> Registrar Entrada
            </button>
          ) : (
            <button onClick={handleCheckOut} className="check-out-btn">
              <i className="fas fa-sign-out-alt"></i> Registrar Salida
            </button>
          )}
        </div>
      </div>

      <div className="stats-card card">
        <h3>Resumen Semanal</h3>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{totalHours.toFixed(1)}</div>
            <div className="stat-label">Horas Trabajadas</div>
          </div>
          <div className="stat">
            <div className="stat-value">{timeRecords.length}</div>
            <div className="stat-label">Días Trabajados</div>
          </div>
        </div>
      </div>

      <div className="time-records card">
        <h3>Registro de Horarios</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {timeRecords.map((record, index) => (
              <tr key={index}>
                <td>{new Date(record.date).toLocaleDateString('es-ES')}</td>
                <td>{record.checkIn}</td>
                <td>{record.checkOut}</td>
                <td>{record.hours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;