import { Handle, Position } from '@xyflow/react';

export function TriggerNode({ data, id }: { data: any, id: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-primary rounded-xl p-4 shadow-xl shadow-primary/10 w-[250px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          ⚡
        </div>
        <div className="font-bold text-sm">Keyword Trigger</div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 font-medium mb-1 block">When user comments:</label>
        <input 
          type="text" 
          value={data.keywords || ""} 
          onChange={(e) => data.onChange(id, 'keywords', e.target.value)}
          placeholder="e.g. price, details" 
          className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-primary text-black dark:text-white"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
}

export function CommentNode({ data, id }: { data: any, id: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
          💬
        </div>
        <div className="font-bold text-sm">Public Comment Reply</div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 font-medium mb-1 block">Reply text:</label>
        <textarea 
          value={data.text || ""} 
          onChange={(e) => data.onChange(id, 'text', e.target.value)}
          placeholder="e.g. Check your DM!" 
          rows={2}
          className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-blue-500 text-black dark:text-white resize-none"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

export function DMNode({ data, id }: { data: any, id: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          ✉️
        </div>
        <div className="font-bold text-sm">Send Private Message</div>
      </div>
      <div>
        <label className="text-xs text-zinc-500 font-medium mb-1 block">Private msg text:</label>
        <textarea 
          value={data.text || ""} 
          onChange={(e) => data.onChange(id, 'text', e.target.value)}
          placeholder="e.g. Here are the details..." 
          rows={3}
          className="w-full text-sm p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 outline-none focus:border-emerald-500 text-black dark:text-white resize-none"
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
}
