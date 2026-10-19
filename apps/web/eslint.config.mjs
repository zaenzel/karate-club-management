import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * Aturan arsitektur dijaga di sini (lihat docs/architecture.md).
 * Catatan: `no-restricted-imports` tidak digabung antar blok — blok yang lebih
 * spesifik menimpa blok umum, jadi tiap blok menuliskan daftar lengkapnya.
 */

const noDirectHttp = [
  {
    group: ['axios', '@/lib/api-client'],
    message:
      'Request HTTP hanya boleh di src/features/<fitur>/api/*. Panggil hook/fungsi dari fitur tersebut.',
  },
];

const noDeepFeatureImport = [
  {
    group: ['@/features/*/*'],
    message:
      'Import fitur lewat public API-nya: `@/features/<fitur>` (index.ts), bukan file internal.',
  },
];

const noFeatureInShared = [
  {
    group: ['@/features', '@/features/*'],
    message:
      'Kode shared (components, hooks, lib, providers, config, types) tidak boleh bergantung pada fitur.',
  },
];

const noCrossFeature = [
  {
    group: ['@/features/*', '../../*'],
    message:
      'Fitur tidak boleh import fitur lain. Pindahkan kode yang dipakai bersama ke folder shared (components/hooks/lib).',
  },
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Default untuk seluruh src (app, mocks, dll).
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...noDirectHttp, ...noDeepFeatureImport] }],
    },
  },

  // Kode shared tidak boleh tahu soal fitur.
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/providers/**/*.{ts,tsx}',
      'src/config/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...noDirectHttp, ...noFeatureInShared] }],
    },
  },

  // Di dalam fitur: pakai import relatif, jangan import fitur lain.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...noDirectHttp, ...noCrossFeature] }],
    },
  },

  // Layer API fitur: satu-satunya tempat yang boleh memakai api-client.
  {
    files: ['src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: noCrossFeature }],
    },
  },

  // api-client sendiri tentu boleh memakai axios.
  {
    files: ['src/lib/api-client.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // Test boleh lebih longgar.
  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);
