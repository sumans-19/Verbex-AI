import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import type { PageId } from './types.ts';

// Page imports
import ManagerView from './pages/ManagerView';
import AllMeetings from './pages/AllMeetings';
import TaskBoard from './pages/TaskBoard';
import DecisionLog from './pages/DecisionLog';
import SpeakerMap from './pages/SpeakerMap';
import StaleTasks from './pages/StaleTasks';
import NewMeeting from './pages/NewMeeting';

function App() {
  const [activePage, setActivePage] = useState<PageId>('manager');

  const handleMeetingClick = () => {
    // Navigate to Task Board for now
    setActivePage('tasks');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'manager': return <ManagerView />;
      case 'meetings': return <AllMeetings onMeetingClick={handleMeetingClick} />;
      case 'tasks': return <TaskBoard />;
      case 'decisions': return <DecisionLog />;
      case 'speakers': return <SpeakerMap />;
      case 'stale': return <StaleTasks />;
      case 'ingest': return <NewMeeting />;
      default: return <ManagerView />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent-green/30 selection:text-accent-green">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <main className="ml-[220px] pt-[56px] min-h-screen">
        <Topbar activePage={activePage} />
        <div className="max-w-[1400px] mx-auto animate-fadeIn">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
