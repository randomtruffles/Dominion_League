# `/_data` Subdirectory

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
