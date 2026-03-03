import { ApartmentDetailView } from "@/features/apartments/components/apartment-detail-view";

type ApartmentDetailPageProps = {
  params: Promise<{
    externalId: string;
  }>;
};

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { externalId } = await params;

  return <ApartmentDetailView externalId={externalId} />;
}
