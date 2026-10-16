/** Portable Mote Studio export. No runtime dependencies. */
export const moteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" aria-hidden="true"><style>
@media (prefers-reduced-motion:no-preference){
  #mote-dizzy{transform-box:fill-box;transform-origin:center;animation:mote-dizzy-sway 4.4s cubic-bezier(.77,0,.175,1) infinite}
  #mote-dizzy-spiral-float{animation:mote-spiral-wobble 4.4s ease-in-out infinite}
  #mote-dizzy-spiral-spin{transform-origin:0 0;animation:mote-spiral-rotate 2.8s linear infinite}
  #mote-dizzy-left,#mote-dizzy-right{animation-duration:5.2s;animation-timing-function:cubic-bezier(.77,0,.175,1);animation-iteration-count:infinite}
  #mote-dizzy-left{transform-origin:133px 158px;animation-name:mote-tired-left}
  #mote-dizzy-right{transform-origin:190px 158px;animation-name:mote-tired-right}
}
@keyframes mote-dizzy-sway{
  0%,100%{transform:translate3d(0,0,0) rotate(-1.8deg) scale(1)}
  50%{transform:translate3d(0,-6px,0) rotate(1.8deg) scale(1.015)}
}
@keyframes mote-spiral-wobble{
  0%,100%{transform:translate3d(0,0,0) rotate(-4deg)}
  50%{transform:translate3d(0,-3px,0) rotate(4deg) scale(1.03)}
}
@keyframes mote-spiral-rotate{
  0%{transform:rotate(0deg)}
  100%{transform:rotate(360deg)}
}
@keyframes mote-tired-left{
  0%,100%{transform:translate3d(0, 8px, 0) scale(1, 0.5);opacity:1}
  38%{transform:translate3d(0, 9.5px, 0) scale(0.95, 0.12);opacity:1}
  52%{transform:translate3d(0, 7.5px, 0) scale(1.02, 0.6);opacity:1}
  72%{transform:translate3d(0, 9px, 0) scale(0.96, 0.22);opacity:1}
}
@keyframes mote-tired-right{
  0%,100%{transform:translate3d(0, 8px, 0) scale(1, 0.5);opacity:1}
  38%{transform:translate3d(0, 9.5px, 0) scale(0.95, 0.12);opacity:1}
  52%{transform:translate3d(0, 7.5px, 0) scale(1.02, 0.6);opacity:1}
  72%{transform:translate3d(0, 9px, 0) scale(0.96, 0.22);opacity:1}
}
</style><defs><clipPath id="mote-dizzy-clip"><path d="M 160 54 C 166.69 54.06 173.65 54.6 180.06 56.15 C 186.47 57.69 192.63 60.21 198.45 63.27 C 204.27 66.33 210.15 70 214.99 74.52 C 219.83 79.03 222.46 86.11 227.49 90.35 C 232.51 94.59 240.49 95.62 245.14 99.98 C 249.78 104.33 253.11 110.54 255.37 116.47 C 257.63 122.41 258.76 129.1 258.68 135.57 C 258.61 142.04 256.76 148.96 254.91 155.3 C 253.06 161.63 247.63 167.39 247.59 173.58 C 247.55 179.78 254.37 186.23 254.68 192.47 C 254.99 198.72 252.45 205.5 249.46 211.04 C 246.46 216.59 241.69 221.74 236.7 225.76 C 231.71 229.78 225.75 233.47 219.53 235.17 C 213.31 236.86 205.85 234.59 199.37 235.91 C 192.9 237.23 187.02 241.78 180.68 243.1 C 174.33 244.41 167.83 244.31 161.3 243.81 C 154.76 243.31 148.04 241.55 141.47 240.12 C 134.91 238.69 128.52 235.96 121.9 235.23 C 115.28 234.49 108.06 236.84 101.77 235.71 C 95.47 234.59 89.33 232.05 84.14 228.48 C 78.95 224.92 74.13 219.77 70.63 214.3 C 67.12 208.83 63.44 202.01 63.09 195.67 C 62.74 189.32 68.28 182.64 68.53 176.24 C 68.79 169.84 65.52 163.65 64.63 157.28 C 63.75 150.91 62.49 144.39 63.21 138.04 C 63.94 131.68 65.58 124.59 68.98 119.13 C 72.38 113.66 79.69 110.53 83.62 105.25 C 87.56 99.97 89.14 92.98 92.58 87.44 C 96.03 81.89 99.56 76.47 104.28 71.98 C 108.99 67.5 114.95 63.23 120.88 60.53 C 126.82 57.83 133.39 56.86 139.9 55.77 C 146.42 54.69 153.31 53.94 160 54 Z"/></clipPath></defs><g id="mote-dizzy"><path d="M 160 54 C 166.69 54.06 173.65 54.6 180.06 56.15 C 186.47 57.69 192.63 60.21 198.45 63.27 C 204.27 66.33 210.15 70 214.99 74.52 C 219.83 79.03 222.46 86.11 227.49 90.35 C 232.51 94.59 240.49 95.62 245.14 99.98 C 249.78 104.33 253.11 110.54 255.37 116.47 C 257.63 122.41 258.76 129.1 258.68 135.57 C 258.61 142.04 256.76 148.96 254.91 155.3 C 253.06 161.63 247.63 167.39 247.59 173.58 C 247.55 179.78 254.37 186.23 254.68 192.47 C 254.99 198.72 252.45 205.5 249.46 211.04 C 246.46 216.59 241.69 221.74 236.7 225.76 C 231.71 229.78 225.75 233.47 219.53 235.17 C 213.31 236.86 205.85 234.59 199.37 235.91 C 192.9 237.23 187.02 241.78 180.68 243.1 C 174.33 244.41 167.83 244.31 161.3 243.81 C 154.76 243.31 148.04 241.55 141.47 240.12 C 134.91 238.69 128.52 235.96 121.9 235.23 C 115.28 234.49 108.06 236.84 101.77 235.71 C 95.47 234.59 89.33 232.05 84.14 228.48 C 78.95 224.92 74.13 219.77 70.63 214.3 C 67.12 208.83 63.44 202.01 63.09 195.67 C 62.74 189.32 68.28 182.64 68.53 176.24 C 68.79 169.84 65.52 163.65 64.63 157.28 C 63.75 150.91 62.49 144.39 63.21 138.04 C 63.94 131.68 65.58 124.59 68.98 119.13 C 72.38 113.66 79.69 110.53 83.62 105.25 C 87.56 99.97 89.14 92.98 92.58 87.44 C 96.03 81.89 99.56 76.47 104.28 71.98 C 108.99 67.5 114.95 63.23 120.88 60.53 C 126.82 57.83 133.39 56.86 139.9 55.77 C 146.42 54.69 153.31 53.94 160 54 Z" fill="#f56a16"/><g id="mote-dizzy-eyes" fill="#151612" clip-path="url(#mote-dizzy-clip)"><g id="mote-dizzy-left" opacity="1" transform="translate(0 8) scale(1 0.5)"><path d="M 118 156 C 121 152, 144 152, 148 156 C 148 161, 142 165, 133 165 C 124 165, 118 161, 118 156 Z"/></g><g id="mote-dizzy-right" opacity="1" transform="translate(0 8) scale(1 0.5)"><path d="M 176 156 C 179 152, 202 152, 205 156 C 205 161, 200 165, 191 165 C 182 165, 176 161, 176 156 Z"/></g></g><g transform="translate(160 56)"><g id="mote-dizzy-spiral-float"><g transform="scale(1.45 0.45)"><g id="mote-dizzy-spiral-spin"><path d="M 0.00 -26.00 C 14.36 -26.00, 29.00 -16.02, 29.00 0.00 C 29.00 16.02, 17.67 32.00, 0.00 32.00 C -17.67 32.00, -35.00 19.33, -35.00 0.00 C -35.00 -19.33, -20.99 -38.00, 0.00 -38.00 C 20.99 -38.00, 41.00 -22.64, 41.00 0.00 C 41.00 22.64, 24.30 44.00, 0.00 44.00 C -24.30 44.00, -47.00 25.96, -47.00 0.00 C -47.00 -25.96, -27.61 -50.00, 0.00 -50.00" fill="none" stroke="#151612" stroke-width="5" vector-effect="non-scaling-stroke" stroke-linecap="round"/></g></g></g></g></g></svg>`;

export function mountMote(target) {
  if (!(target instanceof Element)) throw new TypeError('mountMote expects a DOM Element');
  target.innerHTML = moteSvg;
  return target.querySelector('svg');
}
