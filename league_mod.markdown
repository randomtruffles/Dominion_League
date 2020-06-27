---
title: League Moderator Guide
subtitle: Guide on how to navigate/change/edit the website
layout: default
date: 2020-06-26
author: truffles
---

### League Moderator Guide

This page serves as a guide for league moderators navigating the website.

#### Contents
1. Prerequisites (Getting Set Up)
2. Writing a Post (Signups, Newsletters, Deadlines..)
3. Editing a Post (Rules, FAQ..)
4. Deleting a Post
5. Editing Moderator List (and pictures)
6. How the Website Repository Works

<hr style="border-top: 1px solid darkgray">

#### 1. Prerequisites
1. Create a [Github](https://github.com/) account.
2. Message `@truffles#9347` on discord to give you access to edit the website.
3. The repository is located here: <https://github.com/randomtruffles/Dominion_League>

Once you have access, you will be good to go to make changes!

#### 2. Writing a Post

##### Type of Posts
- <a href="#generic-type">Generic Post</a>
- <a href="#signups-post">Signups Post</a>

##### Generic Type
1. Navigate to where posts are created: [Github Repository](https://github.com/randomtruffles/Dominion_League/tree/master/_posts)
  - (Optional) There is a `README.md` about the `_posts` directory you can read.

2. Click the **Add file > Create new file** button, on the right above the file directory.
<img src="img/league_mod_guide/add_file.png" width="500">

3. It will prompt you to enter a name for the file.
<img src="img/league_mod_guide/edit_file_name.png" width="500">
  - Format of file name must be: `yyyy-mm-dd-PAGE_NAME.markdown`
  - `PAGE_NAME` is what will appear in the URL. You can name it anything, just make sure it does not contain spaces.
  - Examples:
  ```
  2020-06-22-S40-Deadlines.markdown
  2020-06-01-Sign-ups.markdown
  2020-06-03-Welcome.markdown
  ```

4. Edit the file with the contents of the post (it must be in markdown).
* Include a **mandatory** header (this will configure the layout of the page, the title, date etc.) -  see example below.
  * (Mandatory) means you must include something
  * (Optional) means you can leave it blank
  * (Copy Exact) Copy this line exactly and do not change.
- Header (for you to copy and edit). Text after `#` are comments and will be ignored.
```
  ---
  layout: post #(Copy Exact) Do not change
  title: Season 41 - Sign-ups #(Mandatory) Should be a short
  subtitle: Sign-ups Open #(Optional) Can leave blank
  author: truffles #(Mandatory) Your name!
  date: 2020-06-01 #(Mandatory) Today's date
  categories: pinned #(Optional) See types of categories below
  ---
```
* Types of header categories
  * You can have multiple categories. Separate them with a space.
  ```
  categories: pinned signups archive
  ```
  * **pinned**: This will add the post to the "pinned" section of the [Posts](/posts.html) page.
  * **signups**: Only __one__ post should have this tag. It will change the [Signups](/signups.html) page.
  * **archive**: It will not be displayed in the [Posts](/posts.html) page
5. Commit the post! Scroll to the bottom of the page to __Commit New File__.
* Add a description to let league mod contributors know what you did. Something short will suffice.
```
Create season 40 sign-up
```
* Click the **Commit New File** button. Wait a few seconds, and it should be live!
<img src="img/league_mod_guide/commit_file.png" width="500">

##### Signups Post
1. Navigate to where posts are created: [Github Repository](https://github.com/randomtruffles/Dominion_League/tree/master/_posts)
  - (Optional) There is a `README.md` about the `_posts` directory you can read.

2. Click the **Add file > Create new file** button, on the right above the file directory.
<img src="img/league_mod_guide/add_file.png" width="500">

3. It will prompt you to enter a name for the file.
<img src="img/league_mod_guide/edit_file_name.png" width="500">
  - Format of file name must be: `yyyy-mm-dd-PAGE_NAME.markdown`
  - `PAGE_NAME` is what will appear in the URL. You can name it anything, just make sure it does not contain spaces.
  - Examples:
  ```
  2020-06-22-S40-Deadlines.markdown
  2020-06-01-Sign-ups.markdown
  2020-06-03-Welcome.markdown
  ```

4. Edit the file with the contents of the post (it must be in markdown).
* Include a **mandatory** header (this will configure the layout of the page, the title, date etc.) -  see example below.
  * (Mandatory) means you must include something
  * (Optional) means you can leave it blank
  * (Copy Exact) Copy this line exactly and do not change.
- Header (for you to copy and edit). Text after `#` are comments and will be ignored.
```
  ---
  layout: post #(Copy Exact) Do not change
  title: Season 41 - Sign-ups #(Mandatory) Should be a short
  subtitle: Sign-ups Open #(Optional) Can leave blank
  author: truffles #(Mandatory) Your name!
  date: 2020-06-01 #(Mandatory) Today's date
  categories: pinned #(Optional) See types of categories below
  ---
```
* Types of header categories
  * You can have multiple categories. Separate them with a space.
  ```
  categories: pinned signups archive
  ```
  * **pinned**: This will add the post to the "pinned" section of the [Posts](/posts.html) page.
  * **signups**: Only __one__ post should have this tag. It will change the [Signups](/signups.html) page.
  * **archive**: It will not be displayed in the [Posts](/posts.html) page
