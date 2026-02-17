import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

export function SocialShareButtons() {
  const shareText = "I'm supporting GlucoForge - a community-built platform helping people with Type 1 diabetes manage their condition with less stress. Join us!";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://glucoforge.com';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Spread the Word</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Help us find allies by sharing our mission with your network. Every share helps us reach someone who might benefit from or contribute to our platform.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
            Share on Twitter
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            Share on LinkedIn
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-5 w-5 text-[#1877F2]" />
            Share on Facebook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
