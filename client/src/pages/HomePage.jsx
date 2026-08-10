import MediaListPage from '../components/MediaListPage';

export default function HomePage() {
  return (
    <MediaListPage
      type="movie"
      titleFor={{ day: 'Trending Today', week: 'Trending This Week' }}
      heroTypes
    />
  );
}
