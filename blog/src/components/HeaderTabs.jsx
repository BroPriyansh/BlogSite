import { Button } from './ui/button';

export default function HeaderTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Blog Editor</h1>
      <div className="flex space-x-2">
        <Button variant={activeTab === 'editor' ? 'default' : 'outline'} onClick={() => setActiveTab('editor')}>
          Editor
        </Button>
        <Button variant={activeTab === 'list' ? 'default' : 'outline'} onClick={() => setActiveTab('list')}>
          My Posts
        </Button>
      </div>
    </div>
  );
}
