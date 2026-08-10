import { Intro } from '@/components/midia/Intro';
import { FeaturedArticle } from '@/components/midia/FeaturedArticle';
import { Videos } from '@/components/midia/Videos';
import { ArticleGrid } from '@/components/midia/ArticleGrid';

export default function MidiaPage() {
  return (
    <>
      <Intro />
      <FeaturedArticle />
      <Videos />
      <ArticleGrid />
    </>
  );
}
