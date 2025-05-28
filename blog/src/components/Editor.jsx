// import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Save, Upload, Clock } from 'lucide-react';



export default function Editor({
  currentPost,
  isSaving,
  lastSaved,
  title,
  content,
  tags,
  setTitle,
  setContent,
  setTags,
  handleSaveDraft,
  handlePublish,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{currentPost ? 'Edit Post' : 'New Post'}</span>
          {lastSaved && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your blog title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your blog content here..." className="min-h-[200px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="technology, react..." />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || (!title && !content)}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={handlePublish} disabled={isSaving || !title || !content}>
          <Upload className="w-4 h-4 mr-2" />
          {isSaving ? 'Publishing...' : 'Publish'}
        </Button>
      </CardFooter>
    </Card>
  );
}
