interface TabBarProps {
  activeTab: 'recipes' | 'boards';
  onChange: (tab: 'recipes' | 'boards') => void;
}

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="relative flex border-b border-black/10">
      {(['recipes', 'boards'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`
            relative px-6 py-3 text-sm font-medium capitalize transition-colors duration-150
            ${activeTab === tab ? 'text-primary' : 'text-text/50 hover:text-text/80'}
          `}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200" />
          )}
        </button>
      ))}
    </div>
  );
}
