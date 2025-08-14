<template>
  <div id="app">
    <!-- Global header (fixed, above hero) -->
    <header class="global-header">
      <!-- Final, clickable header logo (we animate this one) -->
      <a class="header-logo" href="/" aria-label="Home">CHLOE<br/>MARIE</a>

      <div class="header-infos">
        <span class="photographer-caption" data-reveal="wipe">
          <br/> 
        </span>
        <span class="last-update-caption" data-reveal="wipe">
          MULTIDISCIPLINARY ARTIST<br/> BASED IN LITTLE ROCK,AR
        </span>
      </div>

      <ul class="menu">
        <li data-reveal="wipe"><a href="/" class="active">INDEX</a></li>
        <li data-reveal="wipe"><a href="/work">WORK</a></li>
        <li data-reveal="wipe"><a href="/gallery">GALLERY</a></li>
        <li data-reveal="wipe"><a href="/about">ABOUT</a></li>
      </ul>
    </header>

    <router-view/>
  </div>
</template>

<script>
export default { name: "App" };
</script>

<style>
/* Header sits above hero/content */
.global-header{
  position: fixed !important;
  top: 0; left: 0; width: 100vw; height: 80px;
  background: transparent;
  z-index: 1000;
  pointer-events: none; /* let inner items decide */
}

/* Header logo (final spot/size) */
.header-logo{
  position: fixed;
  left: 12px;         /* tweak to your grid */
  top: 26px;         /* tweak to your grid */
  z-index: 1001;
  font-family: 'Oswald', Arial, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  line-height: .86;
  letter-spacing: -0.02em;
  font-size: 40px;   /* final size */
  color: #000;
  text-decoration: none;
  will-change: transform;
  opacity: 1;
  pointer-events: auto;
}

/* Header infos grid (unchanged from your version, trimmed) */
.header-infos{
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  width: 1476px;
  height: 30px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 30px;
  z-index: 1001;
  pointer-events: none;
}
.photographer-caption,
.last-update-caption{
  font-family: var(--primary-font, 'Oswald', Arial, sans-serif);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 17.5px;
  color: #000;
  opacity: .92;
  pointer-events: auto;
}
.photographer-caption{ grid-column: 3 / 6; text-align: center; }
.last-update-caption{ grid-column: 6 / 8; text-align: left; }

/* Menu (top-right) */
.menu{
  position: fixed;
  right: 30px; top: 30px;
  display: flex; gap: .3rem;
  list-style: none; padding: 0; margin: 0;
  font-size: 19px; text-transform: uppercase; letter-spacing: .01em;
  z-index: 1001; pointer-events: auto;
}
.menu li{ display: inline; }
.menu a{ color: #bbb; text-decoration: none; transition: color .25s; font-weight: 500; }
.menu a.active{ color: #000; text-decoration: underline; }
.menu li:not(:last-child)::after{ content: ","; color: #000; margin-left: .2em; }

/* Responsive bits */
@media (max-width: 1200px){
  .header-infos{ width: 100vw; left: 0; transform: none; padding: 0 16px; }
}
@media (max-width: 700px){
  .menu{ top: 18px; right: 10px; font-size: 15px; }
  .header-infos{ top: 16px; }
}
</style>
