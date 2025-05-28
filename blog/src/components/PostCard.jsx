import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';


export default function PostCard({ post, onEdit }) {
  return (
    <Card key={post.id}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{post.title}</CardTitle>
        <span className="text-sm text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</span>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">{post.content.substring(0, 200)}...</p>
        {post.tags && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.split(',').map(tag => (
              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className={`text-sm ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
          {post.status === 'published' ? 'Published' : 'Draft'}
        </span>
        <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
