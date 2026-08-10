import MediaListPage from '../components/MediaListPage';

export default function TVShowsPage() {
  return (
    <MediaListPage
      type="tv"
      titleFor={{ day: 'Trending Today', week: 'Trending This Week' }}
      heroTypes
    />
  );
}
