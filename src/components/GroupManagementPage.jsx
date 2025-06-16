import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ArrowLeftIcon, PlusIcon, TrashIcon, EditIcon } from 'lucide-react'

const defaultGroups = [
  { name: "Pre Wedding", description: "Engagement and pre-wedding photos" },
  { name: "Engagement/Proposal", description: "Proposal and engagement moments" },
  { name: "Ceremony", description: "Wedding ceremony moments" },
  { name: "Post Wedding", description: "Post-ceremony celebrations" },
  { name: "Traditional", description: "Traditional ceremony and customs" },
  { name: "After Party", description: "After party celebrations" },
  { name: "Reception", description: "Reception and dinner photos" }
]

export default function GroupManagementPage({ album, onBack, onUpdateGroups }) {
  const groups = album.groups || []
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDefaultGroupsDialog, setShowDefaultGroupsDialog] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)

  const addGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: Date.now(),
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || `Photos and videos for ${newGroupName.trim()}`
      }
      const updatedGroups = [...groups, newGroup]
      onUpdateGroups(updatedGroups)
      setNewGroupName('')
      setNewGroupDescription('')
      setShowAddDialog(false)
    }
  }

  const addDefaultGroup = (defaultGroup) => {
    const newGroup = {
      id: Date.now(),
      name: defaultGroup.name,
      description: defaultGroup.description
    }
    const updatedGroups = [...groups, newGroup]
    onUpdateGroups(updatedGroups)
  }

  const removeGroup = (groupId) => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      const updatedGroups = groups.filter(group => group.id !== groupId)
      onUpdateGroups(updatedGroups)
    }
  }

  const updateGroup = (groupId, updatedGroup) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId ? { ...group, ...updatedGroup } : group
    )
    onUpdateGroups(updatedGroups)
    setEditingGroup(null)
  }

  const availableDefaultGroups = defaultGroups.filter(
    defaultGroup => !groups.some(group => group.name === defaultGroup.name)
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Albums
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Groups</h1>
              <p className="text-gray-600">{album.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {availableDefaultGroups.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => setShowDefaultGroupsDialog(true)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Common Groups
              </Button>
            )}
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Custom Group
            </Button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="max-w-4xl mx-auto p-6">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups created yet</h3>
            <p className="text-gray-600 mb-6">Create groups to organize your event photos and videos</p>
            <div className="flex justify-center gap-3">
              {availableDefaultGroups.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowDefaultGroupsDialog(true)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Common Groups
                </Button>
              )}
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Custom Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900">{group.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGroup(group)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{group.description}</p>
                  <div className="mt-4 text-xs text-gray-400">
                    0 photos • 0 videos
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Group Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create Custom Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Bridal Party"
                className="bg-white text-gray-900 border-gray-300"
                onKeyPress={(e) => e.key === 'Enter' && addGroup()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Brief description of this group"
                className="w-full h-20 px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={addGroup}
                disabled={!newGroupName.trim()}
                className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Default Groups Dialog */}
      {availableDefaultGroups.length > 0 && (
        <Dialog open={showDefaultGroupsDialog} onOpenChange={setShowDefaultGroupsDialog}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Common Event Groups</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableDefaultGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addDefaultGroup(group)}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDefaultGroupsDialog(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Group Dialog */}
      {editingGroup && (
        <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Edit Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  className="w-full h-20 px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingGroup(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateGroup(editingGroup.id, editingGroup)}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </div>
  )
}