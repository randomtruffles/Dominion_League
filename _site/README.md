# Dominion League Website

This website is a static site dedicated to the Dominion League.
The site is generated using [Jekyll](https://jekyllrb.com/docs/), which is a static site generator.

## Table of Contents
1. How the repository is organized
  - Main Directory
  - `/_posts` Subdirectory
  - `/_data` Subdirectory
  - `/img` Subdirectory
  - `/_layouts` Subdirectory
  - `/_includes` Subdirectory
2. How to write a post/newsletter
3. How to update a page
4. How to change a moderator picture
5. (Devs) Development Set-Up Instructions
6. (Devs) Why use Jekyll?

### How the repository is organized

#### Main Directory

- The main directory contains all the main pages found in the navigation bar (anything ending in `.html` or `.markdown` represents a page on the website)
  - `index.html` (Home page)
  - `sign-ups.html` (Sign-ups)
  - `matches.html` (Matches)
  - etc.
- Other files in the main directory are used to generate the site, and are not important (eg. `Gemfile`)

#### `/_posts` Subdirectory

- This contains all newsletters/sign-ups/update posts made by the league. All the files are written in `YYYY-MM-DD-<Title_of_article>.markdown`. Any markdown syntax (ie. bolding/headings) will be converted automatically to the same syntax in the physical site page.

#### `/img` Subdirectory

- This contains all images used on the site. The images are organized into its relevant category (eg. `/moderators` contains all pictures of the moderators)

#### `/_data` Subdirectory

- This contains all overall "information" and "settings" of the site (ie. the moderators, the template settings, etc.) to be used by pages and must be in `.yml` format.
  - `moderators.yaml`
    - Contains a list of moderators and information regarding name, discord handle, etc. to be used. Eg.
    ```
    - name: truffles
      discord: truffles#9374
      description: truffles likes truffles
      image: truffles
    ```
  - `nav.yml`
    - Contains the pages to be generated in the navigation bar. Eg.
    ```
    - name: About
      path: rules.html
      section_id: about
      children:
        - name: Rules
          path: rules.html
        - name: F.A.Q.
          path: faq.html
    - name: Matches
      ...
    ```
  - `template.yaml`
    - Contains the template settings to be used across the site, including font, colors etc.

#### `/_layouts` Subdirectory

- This contains all types of layouts you can use throughout the site. Eg. `default, newsletters, post...`. You can specify how a page looks by indicating `layout = default` at the top of each `.html` or `.markdown`.
  - Ex. All the posts in `/_posts` have `layout = post` at the top.

#### `/_includes` Subdirectory

- This contains all the things that can be included in each page of the site. For example, the `header.html`, `footer.html`, `sidebar.html` etc.




### Development Set-up Instructions
To run and test the site locally
1. Install Jekyll using the instructions [here](https://jekyllrb.com/docs/installation/).
2. Install Ruby using the instructions [here](https://www.ruby-lang.org/en/documentation/installation/)
3. Install Bundler using the instructions [here](https://bundler.io/)
4. In your terminal in the project's folder, run `bundle exec jekyll serve`.
   - It will provide you with a port to launch your site locally

### Why use Jekyll?
- It is able to generate static pages, which increases the simplicity. For example, it is able to take markdown pages and generate complete pages.
  - This means that moderators with limited dev experience, can contribute to the site with only knowing markdown.
- Jekyll has built in design control, meaning that it is easy to make a few templates and use pre-created templates for multiple pages.
- Can be used with Github, which means that we don't need to pay for hosting (as you can host it on Github!)
