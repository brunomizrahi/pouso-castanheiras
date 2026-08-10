import { Intro } from '@/components/chegar/Intro';
import { RouteMap } from '@/components/chegar/RouteMap';
import { Stages } from '@/components/chegar/Stages';
import { SeaplaneFeature } from '@/components/chegar/SeaplaneFeature';
import { TransferOptions } from '@/components/chegar/TransferOptions';
import { Faq } from '@/components/chegar/Faq';
import { OrganizeSteps } from '@/components/chegar/OrganizeSteps';

export default function ComoChegarPage() {
  return (
    <>
      <Intro />
      <RouteMap />
      <Stages />
      <SeaplaneFeature />
      <TransferOptions />
      <Faq />
      <OrganizeSteps />
    </>
  );
}
