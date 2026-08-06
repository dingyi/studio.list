import caseStudiesData from "../data/case-studies.json";
import { publishedAgencies, type Agency } from "./catalog";

export interface CaseStudy {
  id: string;
  agencySlug: string;
  title: string;
  url: string;
  image: string;
  capturedAt: string;
}

export interface CaseStudyWithAgency extends CaseStudy {
  agency: Agency;
}

export const allCaseStudies = caseStudiesData as CaseStudy[];

export function caseStudiesWithAgency(): CaseStudyWithAgency[] {
  const agenciesBySlug = new Map(
    publishedAgencies.map((agency) => [agency.slug, agency]),
  );
  return allCaseStudies
    .flatMap((caseStudy) => {
      const agency = agenciesBySlug.get(caseStudy.agencySlug);
      return agency ? [{ ...caseStudy, agency }] : [];
    })
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt));
}
