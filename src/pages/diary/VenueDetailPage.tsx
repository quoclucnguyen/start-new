import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { DotLoading, Toast } from 'antd-mobile';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { EmptyState, SectionHeader } from '@/components/shared';
import { VenueStatusBadge } from '@/components/diary/venue-status-badge';
import { MealLogCard } from '@/components/diary/meal-log-card';
import { RatingInput } from '@/components/diary/rating-input';
import {
  useVenue,
  useMenuItems,
  useMealLogs,
  useUpdateVenue,
  useAddMenuItem,
} from '@/api/diary';
import { formatCost } from '@/api/diary/types';
import type { VenueStatus, MenuItem } from '@/api/diary/types';

export const VenueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: venue, isLoading: venueLoading } = useVenue(id ?? null);
  const { data: menuItems } = useMenuItems(id ?? null);
  const { data: allLogs } = useMealLogs();
  const updateVenue = useUpdateVenue();
  const addMenuItem = useAddMenuItem();

  const venueLogs = allLogs?.filter((l) => l.venueId === id) ?? [];
  const favorites = menuItems?.filter((i) => i.isFavorite) ?? [];
  const blacklisted = menuItems?.filter((i) => i.isBlacklisted) ?? [];

  const handleStatusChange = (status: VenueStatus) => {
    if (!id) return;
    updateVenue.mutate({ id, status });
  };

  const handleAddDish = () => {
    const name = window.prompt('Tên món');
    if (name && id) {
      addMenuItem.mutate(
        { venueId: id, name },
        {
          onSuccess: () => Toast.show({ icon: 'success', content: 'Đã thêm món' }),
        },
      );
    }
  };

  if (venueLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-screen">
          <DotLoading color="primary" />
        </div>
      </AppShell>
    );
  }

  if (!venue) {
    return (
      <AppShell>
        <TopAppBar
          title="Quán"
          leftAction={
            <IconButton onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </IconButton>
          }
        />
        <div className="flex flex-col items-center py-12 text-muted-foreground">
          <p>Không tìm thấy quán</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopAppBar
        title={venue.name}
        leftAction={
          <IconButton onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </IconButton>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        {/* Venue Info */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2">
            <VenueStatusBadge status={venue.status} />
            {venue.address && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={14} />
                {venue.address}
              </span>
            )}
          </div>

          {venue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {venue.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {venue.notes && (
            <p className="text-sm text-muted-foreground">{venue.notes}</p>
          )}

          {/* Status Toggle */}
          <div className="flex gap-2">
            {(['favorite', 'neutral', 'blacklisted'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  venue.status === s
                    ? s === 'favorite'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : s === 'blacklisted'
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-border bg-secondary text-foreground'
                    : 'border-border/50 bg-secondary/50 text-muted-foreground'
                }`}
              >
                {s === 'favorite' ? '⭐ Yêu thích' : s === 'blacklisted' ? '🚫 Tránh' : 'Bình thường'}
              </button>
            ))}
          </div>
        </div>

        {/* Món tủ (Favorite Dishes) */}
        {favorites.length > 0 && (
          <section className="mb-6">
            <SectionHeader title="⭐ Món nên thử" />
            <div className="flex flex-col gap-2 mt-2">
              {favorites.map((item) => (
                <DishRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Blacklisted Dishes */}
        {blacklisted.length > 0 && (
          <section className="mb-6">
            <SectionHeader title="🚫 Món nên tránh" />
            <div className="flex flex-col gap-2 mt-2">
              {blacklisted.map((item) => (
                <DishRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* All Dishes */}
        <section className="mb-6">
          <SectionHeader
            title="Tất cả món"
            action={
              <button
                type="button"
                onClick={handleAddDish}
                className="text-sm text-primary font-medium"
              >
                Thêm
              </button>
            }
          />
          <div className="flex flex-col gap-2 mt-2">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <DishRow key={item.id} item={item} />
              ))
            ) : (
              <EmptyState
                title="Chưa có món nào"
                description="Thêm món để bắt đầu xây dựng kỷ niệm cho quán này."
              />
            )}
          </div>
        </section>

        {/* Visit History */}
        <section>
          <SectionHeader title="Lịch sử ghé thăm" />
          <div className="flex flex-col gap-2 mt-2">
            {venueLogs.length > 0 ? (
              venueLogs.map((log) => (
                <MealLogCard
                  key={log.id}
                  log={log}
                  onClick={() => navigate(`/diary/history?mealLogId=${log.id}`)}
                />
              ))
            ) : (
              <EmptyState
                title="Chưa ghé thăm lần nào"
                description="Dùng nút bên dưới để ghi món đầu tiên tại quán này."
              />
            )}
          </div>
        </section>

        {/* FAB: Log here */}
        <div className="fixed bottom-8 right-4 z-50">
          <button
            type="button"
            onClick={() => navigate(`/diary/log?venue=${id}`)}
            className="flex items-center gap-2 px-5 h-12 rounded-full bg-primary shadow-lg shadow-primary/40 text-primary-foreground font-medium transform active:scale-95 transition-transform"
          >
            <Plus size={20} />
            Ghi tại đây
          </button>
        </div>
      </main>
    </AppShell>
  );
};

// Simple dish row component
const DishRow: React.FC<{ item: MenuItem }> = ({ item }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-foreground text-sm">{item.name}</p>
      {item.lastPrice != null && (
        <p className="text-xs text-muted-foreground">{formatCost(item.lastPrice)}</p>
      )}
    </div>
    {item.personalRating != null && (
      <RatingInput value={item.personalRating} size={12} readOnly />
    )}
    {item.isFavorite && <span className="text-sm">⭐</span>}
    {item.isBlacklisted && <span className="text-sm">🚫</span>}
  </div>
);
