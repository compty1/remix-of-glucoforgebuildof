import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Check, X, Clock, MapPin, UserPlus, Users, Send, UserMinus, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUnreadCounts } from '@/hooks/useDirectMessages';
import { DirectMessagePanel } from './DirectMessagePanel';
import type { ConnectionRequest, DiabeticProfile } from '@/hooks/useDiabeticProfiles';

interface ConnectionsTabProps {
  userId: string;
  myRequests: ConnectionRequest[];
  connectedProfiles: DiabeticProfile[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onRemove: (requestId: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function ConnectionsTab({ userId, myRequests, connectedProfiles, onAccept, onDecline, onRemove, isUpdating, isRemoving }: ConnectionsTabProps) {
  const profileMap = new Map(connectedProfiles.map(p => [p.user_id, p]));
  const { data: unreadCounts = {} } = useUnreadCounts();

  const incoming = myRequests.filter(r => r.to_user_id === userId && r.status === 'pending');
  const accepted = myRequests.filter(r => r.status === 'accepted');
  const sent = myRequests.filter(r => r.from_user_id === userId && r.status === 'pending');

  const getOtherUserId = (r: ConnectionRequest) => r.from_user_id === userId ? r.to_user_id : r.from_user_id;

  const [disconnectReq, setDisconnectReq] = useState<{ id: string; name: string } | null>(null);
  const [dmTarget, setDmTarget] = useState<{ userId: string; name: string } | null>(null);

  return (
    <div className="space-y-8">
      {/* Incoming Requests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Incoming Requests
          {incoming.length > 0 && <Badge variant="destructive">{incoming.length}</Badge>}
        </h2>

        {incoming.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending requests right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incoming.map(req => {
              const profile = profileMap.get(req.from_user_id);
              return (
                <Card key={req.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold truncate">{profile?.display_name || 'Unknown User'}</p>
                      {profile?.city && profile?.state && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                        </p>
                      )}
                      {req.message && (
                        <p className="text-sm text-muted-foreground italic">"{req.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => onAccept(req.id)} disabled={isUpdating}>
                          <Check className="h-3 w-3 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDecline(req.id)} disabled={isUpdating}>
                          <X className="h-3 w-3 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* My Connections */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          My Connections
          {accepted.length > 0 && <Badge variant="secondary">{accepted.length}</Badge>}
        </h2>

        {accepted.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No connections yet. Accept incoming requests or send your own!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accepted.map(req => {
              const otherUserId = getOtherUserId(req);
              const profile = profileMap.get(otherUserId);
              const unread = unreadCounts[otherUserId] || 0;
              const displayName = profile?.display_name || 'Unknown User';
              return (
                <Card key={req.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 relative">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {displayName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{displayName}</p>
                        {profile?.city && profile?.state && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                          </p>
                        )}
                        {profile?.device_setup && (
                          <p className="text-xs text-muted-foreground truncate">{profile.device_setup}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Connected {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 relative"
                        onClick={() => setDmTarget({ userId: otherUserId, name: displayName })}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" /> Message
                        {unread > 0 && (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                            {unread}
                          </Badge>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDisconnectReq({ id: req.id, name: displayName })}
                        disabled={isRemoving}
                      >
                        <UserMinus className="h-3 w-3 mr-1" /> Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Sent Requests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Sent Requests
        </h2>

        {sent.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              You haven't sent any requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sent.map(req => {
              const profile = profileMap.get(req.to_user_id);
              return (
                <Card key={req.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                        {(profile?.display_name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile?.display_name || 'Unknown User'}</p>
                      {profile?.city && profile?.state && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectReq} onOpenChange={(open) => !open && setDisconnectReq(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect from {disconnectReq?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your connection. You'll need to send a new request to reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (disconnectReq) {
                  onRemove(disconnectReq.id);
                  setDisconnectReq(null);
                }
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DM Panel */}
      <DirectMessagePanel
        open={!!dmTarget}
        onClose={() => setDmTarget(null)}
        otherUserId={dmTarget?.userId ?? null}
        otherUserName={dmTarget?.name ?? ''}
      />
    </div>
  );
}
