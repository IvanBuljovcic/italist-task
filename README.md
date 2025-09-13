This is a [Next.js](https://nextjs.org) project bootstrapped with [314-code/nextjs-template](https://github.com/314-code/nextjs-template).

## Getting Started

First, install dependencies

```bash
pnpm i

#or

pnpm install
```

Then. run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project implementation

The focus of the project for me was to implement the requested features:
- Loading products via API
    - Infinite scroll
    - Filtering via size
    - Filtering via text (title, description, brand)
- Having a responsive layout
- Making it accessible
- Clean and clear code

### Products API

The data for products is sourced locally from `data/products.json` but it is being served from the Next API in `app/api/products/route.ts`.
The route is providing data of how many pages there are, how many products in total, is there a next page etc.

There is no paging on the application but it is necessary to have a "paging" implmented in the API so that the client knows when the end of the stream is reached and when to stop calling further pages.

The API includes filtering by size array `string[]` and by search `string`.
Filtering by search is checking if the searched string is included in the title, description or brand.

One could argue that the category would have been a good target for checking the string but the category could be its own filter.
Now that I think about it, the Brand could have beed a separate filter as well...

Both sizes and search are appended to the URL string on change.

#### Infinite scroll

Initially only 20 products are loaded. There is a hidden element on the page that is checked with the `IntersectionObserver` if it is intersecting. If it is, the next page/batch of products is loaded.

Each product is using the `Image` element with a placeholder while the image is being fetched.

I tried to implement the blur placeholder but for what ever reason, it was not working.

### Accessibility

For testing the accessibility I used both the Lighthouse devtool and AxeDevtools (free version).

Axe gave me some good insights namely that I was missing landmarks for the pages `<h1>` and that buttons were missing screen-readable text i.e. favorite buttons were left "blank" as far as screen readers were concerned.

This is the field that I most regret not investing more time into, both in this project and in others.

As this was made from a boilerplate project I am working on, I plan on add keyboard navigation, accessibility tests and implementing helper HOC's for greater accessibility in the boilerplate itself.

### Codebase

One of the great struggles of developers is making the codebase maintainable, (human) readable and easy to use.

I have tried as much as possible to have components be SSR with only the bare minimum being client-rendered.

This field as well is one that could always do with improving.

### SEO

I have honestly never worked with setting SEO other than using the correct markup and structure for elements so having learn a bit of how this is implemented was both interesting and daunting.

For the code generation I have to admit that I trusted [`Claude AI`](https://claude.ai/) to provide it since I am quite lost with SEO.

## TODO
I would have liked to create a page for products, implement tests and try to minimize client side rendering further.

Also the single API is doing a lot of work with "fetching" the products, filtering and providing the sizes array for sizes filter. This could also be split to have each filter be provided by a dedicated API.