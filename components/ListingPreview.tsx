'use client';

import { useState, useEffect } from 'react';
import { Edit2, Eye, FileText, Sparkles } from 'lucide-react';
// Note: Listing copy generation is handled in parent component

interface ListingPreviewProps {
  listingCopy: { title: string; description: string; tags: string[] };
  onCopyUpdated: (copy: { title: string; description: string; tags: string[] }) => void;
}

export function ListingPreview({ listingCopy: initialCopy, onCopyUpdated }: ListingPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialCopy.title);
  const [editedDescription, setEditedDescription] = useState(initialCopy.description);
  const [editedTags, setEditedTags] = useState<string[]>(initialCopy.tags);

  // Update when initial copy changes
  useEffect(() => {
    setEditedTitle(initialCopy.title);
    setEditedDescription(initialCopy.description);
    setEditedTags(initialCopy.tags);
  }, [initialCopy]);

  if (!initialCopy || !initialCopy.title) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-white" />
          <h3 className="text-xl font-bold text-white">Your Listing Preview</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              maxLength={80}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-semibold"
              placeholder="Enter listing title..."
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {editedTitle}
            </h2>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {editedTitle.length}/80 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 leading-relaxed resize-y"
              placeholder="Enter listing description..."
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {editedDescription}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedTags.join(', ')}
                onChange={(e) => setEditedTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                placeholder="Enter tags separated by commas..."
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {isEditing && (
          <button
            onClick={() => {
              const updated = {
                title: editedTitle,
                description: editedDescription,
                tags: editedTags,
              };
              onCopyUpdated(updated);
              setIsEditing(false);
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
