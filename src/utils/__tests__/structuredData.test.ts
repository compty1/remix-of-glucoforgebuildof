import { describe, it, expect } from 'vitest';
import {
  getOrganizationJsonLd,
  getArticleJsonLd,
  getMedicalEntityJsonLd,
  getFaqJsonLd,
} from '../structuredData';

describe('structuredData', () => {
  it('generates valid Organization JSON-LD', () => {
    const data = getOrganizationJsonLd();
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('GlucoForge');
    expect(data.nonprofitStatus).toBe('501(c)(3)');
  });

  it('generates valid Article JSON-LD', () => {
    const data = getArticleJsonLd({
      title: 'Test Article',
      description: 'A test',
      url: 'https://glucoforge.org/articles/test',
      publishedAt: '2026-01-01',
    });
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test Article');
    expect(data.datePublished).toBe('2026-01-01');
  });

  it('generates valid MedicalEntity JSON-LD', () => {
    const data = getMedicalEntityJsonLd({
      name: 'Type 1 Diabetes',
      description: 'Autoimmune condition',
      url: 'https://glucoforge.org/cure',
    });
    expect(data['@type']).toBe('MedicalCondition');
    expect(data.name).toBe('Type 1 Diabetes');
  });

  it('generates valid FAQ JSON-LD', () => {
    const data = getFaqJsonLd([
      { question: 'What is T1D?', answer: 'An autoimmune condition.' },
    ]);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(1);
    expect(data.mainEntity[0]['@type']).toBe('Question');
  });
});
