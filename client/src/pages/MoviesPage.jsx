import MediaListPage from '../components/MediaListPage';

export default function MoviesPage() {
  return (
    <MediaListPage
      type="movie"
      titleFor={{ day: 'Top Movies', week: 'Top Movies This Week' }}
      heroTypes
    />
  );
}
