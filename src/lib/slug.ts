const slugify = require('slugify');
slugify.extend({ '+': 'plus' });

export function slug(value: string): string {
  return slugify(value, {
    replacement: '_',
    lower: true,
    strict: true,
  });
}
