'use client';

import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import apiClient from '@/lib/api-client';

// Localizer setup for react-big-calendar
const localizer = momentLocalizer(moment);

// We'll mock out standard school hours, e.g., 8:00 AM to 4:00 PM
const minTime = new Date();
minTime.setHours(8, 0, 0);
const maxTime = new Date();
maxTime.setHours(16, 0, 0);

export default function TimetableBuilder() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // In a real app, these would come from the API
  const [classes] = useState([
    { id: '1', name: 'Class 10-A' },
    { id: '2', name: 'Class 9-B' },
  ]);
  const [selectedClass, setSelectedClass] = useState('1');

  useEffect(() => {
    fetchTimetable(selectedClass);
  }, [selectedClass]);

  const fetchTimetable = async (classId: string) => {
    setLoading(true);
    try {
      // Use mock data until the backend returns properly seeded data
      // const res = await apiClient.get(`/timetables/class/${classId}`);
      // const data = res.data;
      
      const mockData = [
        {
          id: 't1',
          title: 'Mathematics (Mr. Sharma)',
          start: new Date(new Date().setHours(9, 0, 0)),
          end: new Date(new Date().setHours(10, 0, 0)),
        },
        {
          id: 't2',
          title: 'Physics (Mrs. Gupta)',
          start: new Date(new Date().setHours(10, 0, 0)),
          end: new Date(new Date().setHours(11, 0, 0)),
        }
      ];
      setEvents(mockData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('Enter Subject and Teacher (e.g., Chemistry - Dr. Patel):');
    if (title) {
      // Prepare createDto for the backend
      const dayOfWeek = start.getDay(); // 0-6
      const startTime = moment(start).format('HH:mm');
      const endTime = moment(end).format('HH:mm');

      // Optimistic update
      const newEvent = {
        id: Math.random().toString(),
        title,
        start,
        end,
      };
      setEvents((prev) => [...prev, newEvent]);

      try {
        // Mock API call to create timetable
        /*
        await apiClient.post('/timetables', {
          classId: selectedClass,
          subjectId: '...',
          teacherId: '...',
          dayOfWeek,
          startTime,
          endTime
        });
        */
      } catch (err) {
        alert('Failed to schedule class. Teacher might be double-booked!');
        setEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
      }
    }
  };

  const handleSelectEvent = (event: any) => {
    if (window.confirm(`Delete '${event.title}'?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      // Delete API call here
    }
  };

  return (
    <div className="timetable-builder animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Timetable Builder</h1>
          <p className="dashboard-subtitle">Drag and drop to schedule classes.</p>
        </div>
        <div className="header-actions">
          <select 
            className="input" 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="btn btn-primary">Publish Schedule</button>
        </div>
      </div>

      <div className="card calendar-container">
        {loading ? (
          <div className="loading-state">Loading timetable...</div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="work_week"
            views={['work_week', 'day']}
            min={minTime}
            max={maxTime}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            style={{ height: 'calc(100vh - 240px)' }}
          />
        )}
      </div>

      <style jsx>{`
        .timetable-builder {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
        }

        .dashboard-subtitle {
          color: hsl(var(--text-muted));
          margin-top: 0.25rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .calendar-container {
          padding: 1.5rem;
          background: hsl(var(--bg-card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-lg);
          min-height: 600px;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: hsl(var(--text-muted));
        }

        /* React Big Calendar custom styles for our theme */
        :global(.rbc-calendar) {
          font-family: inherit;
        }
        :global(.rbc-header) {
          padding: 0.75rem;
          font-weight: 600;
          background: hsl(var(--surface));
          border-bottom: 1px solid hsl(var(--border));
        }
        :global(.rbc-time-content) {
          border-top: 1px solid hsl(var(--border));
        }
        :global(.rbc-time-view) {
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        :global(.rbc-event) {
          background-color: hsl(222, 84%, 55%) !important;
          border-radius: 4px;
          border: none;
          padding: 4px 8px;
        }
        :global(.rbc-today) {
          background-color: hsl(var(--surface) / 0.5);
        }
        :global(.rbc-time-slot) {
          border-color: hsl(var(--border) / 0.3);
        }
      `}</style>
    </div>
  );
}
