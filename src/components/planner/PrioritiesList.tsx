import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Task } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { useTaskStore } from '../../store/taskStore';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../lib/utils';

export function PrioritiesList({ tasks }: { tasks: Task[] }) {
  const reorderPriorities = useTaskStore((s) => s.reorderPriorities);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const ordered = [...tasks].sort((a, b) => (a.priorityOrder ?? 99) - (b.priorityOrder ?? 99));

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const ids = ordered.map((t) => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderPriorities(ids);
    setDragId(null);
    setOverId(null);
  }

  if (ordered.length === 0) {
    return (
      <EmptyState
        title="No priorities picked yet"
        description="Choose up to three things that would make today feel like a win."
        icon={<Plus className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {ordered.slice(0, 3).map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={() => setDragId(task.id)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverId(task.id);
          }}
          onDrop={() => handleDrop(task.id)}
          className={cn('rounded-xl transition-shadow', overId === task.id && dragId !== task.id && 'ring-2 ring-accent-400')}
        >
          <TaskCard task={task} draggableHandle />
        </div>
      ))}
    </div>
  );
}
