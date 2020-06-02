# Dominion League Website

This website is a static site dedicated to the Dominion League.
The site is generated using [Jekyll](https://jekyllrb.com/docs/), which is a static site generator.

This was last updated by: `truffles` on `2020-06-01`

## Table of Contents
1. [How the repository is organized](#how-the-repoistory-is-organized)
    - Main Directory
    - `/_posts` Subdirectory
    - `/_data` Subdirectory
    - `/img` Subdirectory
    - `/_layouts` Subdirectory
    - `/_includes` Subdirectory
2. [How to edit/write a post/newsletter](#how-to-edit-or-write-a-post-or-newsletter)
3. [How to update a page](#how-to-update-a-page) (eg. sign-ups, rules, FAQ)
4. [How to change/add/remove a moderator](#how-to-change-moderator-information)
5. (Devs) [Development Set-Up Instructions](#development-setup-instructions)
6. (Devs) [Why use Jekyll?](#why-use-jekyll?)

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


### How to edit or write a post or newsletter
1. Copy the template post `1000-01-01-DEFAULT_TEMPLATE.markdown` inside the `/_posts` subdirectory
2. Edit the file name so it matches the template `YYYY-MM-DD-NEWSLETTER_TITLE.markdown`
3. Fill in the fields and write your post.
It will automatically generate this page in newsletters.

### How to update a page
##### Example: `sign-ups.html`
1. Navigate to `/posts/YYYY-MM-DD-Sign-ups.markdown`
2. Edit the document with the content you want change. **CHANGE THE DATE OF THE FILE**
  - Eg. if today is 2020/05/20, the file should be renamed `/2020/05/20-Sign-ups.markdown`
3. Navigate to `sign-ups.html`
4. Edit the `<iframes....>` Google Sheets embeddings with the ones for the new season.
##### Example: `rules.markdown` or `faq.markdown`
1. Navigate to the appropriate document. (eg. `rules.markdown`)
2. Modify it.
3. Save and you're done!

### How to change moderator information
**Change/remove/add moderator details**
1. Navigate to `_data/moderators.yml`.
2. Add/remove/change the moderator with the right information. (Instructions are provided at the top)
Eg.
```
- name: Lemonspawn
  discord: Lemonspawn#2571
  description:
  image: lemonspawn
```
**Change/remove/add moderator picture**
1. Navigate to the `/img/moderators/` directory. Replace/add your picture in
  - **Note:** It must be in .png`
  - **Note 2:** The suffix (`suffix.png`) should match what is provided in `moderators.yml` as per instructions in `How to change/remove/add a moderator.`

### Development Setup Instructions
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
