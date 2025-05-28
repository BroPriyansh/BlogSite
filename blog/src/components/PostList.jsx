import { Card, CardContent} from './ui/card';
import { Button } from './ui/button';
import PostCard from './PostCard';

export default function PostList({ posts, filter, setFilter, onEdit }) {
  const filtered = posts.filter(post => filter === 'all' || post.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {['all', 'drafts', 'published'].map((type) => (
          <Button key={type} variant={filter === type ? 'default' : 'outline'} onClick={() => setFilter(type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {filter === 'all'
              ? 'No posts yet. Create your first post!'
              : filter === 'drafts'
              ? 'No drafts found'
              : 'No published posts yet'}
          </CardContent>
        </Card>
      ) : (
        filtered.map(post => <PostCard key={post.id} post={post} onEdit={onEdit} />)
      )}
    </div>
  );
}
