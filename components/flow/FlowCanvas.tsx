"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, CommentNode, DMNode } from './nodes';

const nodeTypes = {
  trigger: TriggerNode,
  comment: CommentNode,
  dm: DMNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Handlers for node data changes
  const onNodeDataChange = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 250, y: 50 },
      data: { keywords: "", onChange: onNodeDataChange },
    }
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pages, setPages] = useState<{pageId: string, name: string}[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [posts, setPosts] = useState<{id: string, message: string, createdTime: string, picture: string | null, permalink: string | null}[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    fetch('/api/facebook/pages')
      .then(res => res.json())
      .then(data => {
        if (data.pages) {
          setPages(data.pages);
        }
        setLoadingPages(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPages(false);
      });
  }, []);

  const fetchPosts = useCallback((pageId: string) => {
    if (!pageId) return;
    setLoadingPosts(true);
    setPosts([]);
    fetch(`/api/facebook/posts?pageId=${pageId}`)
      .then(res => res.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts);
        }
        setLoadingPosts(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPosts(false);
      });
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { onChange: onNodeDataChange },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDataChange]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Extract data from the trigger node
    const triggerNode = nodes.find(n => n.type === 'trigger');
    const commentNode = nodes.find(n => n.type === 'comment');
    const dmNode = nodes.find(n => n.type === 'dm');

    if (!triggerNode?.data?.pageId) {
      alert("Please select a Facebook Page in the Trigger node first.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/automations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          pageId: triggerNode.data.pageId as string,
          postType: (triggerNode.data.postType as string) || 'any',
          postId: (triggerNode.data.postId as string) || null,
          keywords: (triggerNode.data.keywords as string) || '',
          replyText: (commentNode?.data?.text as string) || null,
          dmText: (dmNode?.data?.text as string) || null,
          name: 'My Automation',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Automation saved and activated!");
      } else {
        alert("❌ Error: " + (data.error || "Failed to save"));
      }
    } catch (err) {
      alert("❌ Network error. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-[#0f0f11]">
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div>
          <h2 className="font-bold text-lg">Edit Automation</h2>
          <p className="text-xs text-zinc-500">Auto-reply to comments and send DMs</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Automation"
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 shrink-0 flex flex-col gap-3 shadow-sm z-10">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Building Blocks</h3>
          <p className="text-xs text-zinc-500 mb-2 leading-relaxed">Drag these nodes onto the canvas to your right to build your flow.</p>
          
          <div className="p-3 border border-dashed border-primary/50 bg-primary/5 rounded-xl text-sm font-medium cursor-grab hover:bg-primary/10 transition-colors flex items-center gap-2" onDragStart={(e) => onDragStart(e, 'trigger')} draggable>
            <span className="text-primary">⚡</span> Trigger Keyword
          </div>
          
          <div className="p-3 border border-dashed border-blue-500/50 bg-blue-50 d dark:bg-blue-500/10 rounded-xl text-sm font-medium cursor-grab hover:bg-blue-500/20 transition-colors flex items-center gap-2" onDragStart={(e) => onDragStart(e, 'comment')} draggable>
            <span className="text-blue-500">💬</span> Public Reply
          </div>

          <div className="p-3 border border-dashed border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-sm font-medium cursor-grab hover:bg-emerald-500/20 transition-colors flex items-center gap-2" onDragStart={(e) => onDragStart(e, 'dm')} draggable>
            <span className="text-emerald-500">✉️</span> Private DM
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={({ nodes }) => {
              setSelectedNodeId(nodes.length === 1 ? nodes[0].id : null);
            }}
            nodeTypes={nodeTypes}
            fitView
            className="bg-zinc-50 dark:bg-zinc-900"
          >
            <Controls />
            <Background color="#ccc" gap={16} />
          </ReactFlow>
        </div>

        {/* Settings Sidebar (Right) */}
        {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (() => {
          const selectedNode = nodes.find(n => n.id === selectedNodeId)!;
          return (
            <div className="w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-5 shrink-0 flex flex-col gap-5 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-y-auto animate-in slide-in-from-right-8 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                 <h3 className="font-bold text-sm">Node Settings</h3>
                 <button onClick={() => setSelectedNodeId(null)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold">
                    ✕
                 </button>
              </div>
              
              {selectedNode.type === 'trigger' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Facebook Page</label>
                    <select 
                      className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-primary transition-colors text-black dark:text-white"
                      value={selectedNode.data.pageId as string || ""}
                      onChange={(e) => {
                        onNodeDataChange(selectedNode.id, 'pageId', e.target.value);
                        // Reset post selection when page changes
                        onNodeDataChange(selectedNode.id, 'postId', '');
                        onNodeDataChange(selectedNode.id, 'postType', 'any');
                        if (e.target.value) {
                          fetchPosts(e.target.value);
                        }
                      }}
                    >
                      <option value="">Select a page...</option>
                      {loadingPages ? (
                        <option value="" disabled>Loading pages...</option>
                      ) : pages.length > 0 ? (
                        pages.map(p => (
                          <option key={p.pageId} value={p.pageId}>
                            {p.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No pages connected</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Which Post?</label>
                    <select 
                      className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-primary transition-colors text-black dark:text-white"
                      value={selectedNode.data.postType as string || "any"}
                      onChange={(e) => {
                        onNodeDataChange(selectedNode.id, 'postType', e.target.value);
                        if (e.target.value === 'specific' && selectedNode.data.pageId && posts.length === 0) {
                          fetchPosts(selectedNode.data.pageId as string);
                        }
                      }}
                    >
                      <option value="any">Any Post on Page</option>
                      <option value="specific">Specific Post</option>
                    </select>
                  </div>

                  {selectedNode.data.postType === 'specific' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Select Post</label>
                      {loadingPosts ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-xs text-zinc-500">Loading posts...</span>
                        </div>
                      ) : posts.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                          {posts.map(post => {
                            const isSelected = selectedNode.data.postId === post.id;
                            const previewText = post.message.length > 80 ? post.message.substring(0, 80) + '...' : post.message;
                            const date = new Date(post.createdTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <button
                                key={post.id}
                                onClick={() => onNodeDataChange(selectedNode.id, 'postId', post.id)}
                                className={`w-full text-left p-2.5 rounded-xl border-2 transition-all duration-150 group ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/10'
                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                }`}
                              >
                                <div className="flex gap-2.5">
                                  {post.picture && (
                                    <img
                                      src={post.picture}
                                      alt=""
                                      className="w-14 h-14 rounded-lg object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs leading-relaxed ${
                                      isSelected ? 'text-black dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-400'
                                    }`}>
                                      {previewText}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">{date}</p>
                                  </div>
                                  {isSelected && (
                                    <div className="shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-0.5">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-zinc-500">
                          <p className="text-xs">No posts found on this page.</p>
                          <p className="text-[10px] mt-1">Make sure this page has published posts.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                    <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Trigger Keywords</label>
                    <input 
                      type="text" 
                      className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-primary transition-colors text-black dark:text-white"
                      placeholder="e.g. price, details, info"
                      value={selectedNode.data.keywords as string || ""}
                      onChange={(e) => onNodeDataChange(selectedNode.id, 'keywords', e.target.value)}
                    />
                    <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">Leave blank to trigger on ANY comment. Separate multiple keywords with commas.</p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'comment' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Public Reply Text</label>
                    <textarea 
                      rows={5}
                      className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-blue-500 transition-colors resize-none text-black dark:text-white"
                      placeholder="e.g. We just sent you a DM with the details!"
                      value={selectedNode.data.text as string || ""}
                      onChange={(e) => onNodeDataChange(selectedNode.id, 'text', e.target.value)}
                    />
                    <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">This reply will be posted publicly under the user's comment.</p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'dm' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Direct Message Text</label>
                    <textarea 
                      rows={6}
                      className="w-full text-sm p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 outline-none focus:border-emerald-500 transition-colors resize-none text-black dark:text-white"
                      placeholder="e.g. Hello! Here are the details you requested..."
                      value={selectedNode.data.text as string || ""}
                      onChange={(e) => onNodeDataChange(selectedNode.id, 'text', e.target.value)}
                    />
                    <p className="text-[10.5px] text-zinc-500 mt-2 leading-relaxed">This message will be sent securely to the user's DMs on Facebook/Instagram.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function FlowBuilderContainer() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
