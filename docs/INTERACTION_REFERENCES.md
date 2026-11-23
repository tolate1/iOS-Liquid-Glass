# UI and motion references

| Repository | What informed the engine |
| --- | --- |
| [Motion](https://github.com/motiondivision/motion) | Interruptible presentation values, shared timing and reduced motion. The sheet reads its displayed offset when the pointer takes over from an entrance animation. |
| [Vaul](https://github.com/emilkowalski/vaul) | Drawer anatomy, a dedicated drag handle and release thresholds. The upstream repository is unmaintained and serves as a design reference. |
| [Radix Primitives](https://github.com/radix-ui/primitives) | Accessible control contracts, keyboard activation and predictable focus after dismissing an overlay. The engine uses native checkbox, range and dialog primitives. |
| [Fluid Components](https://github.com/cigar/fluid-components/blob/main/motion-guidelines.md) | Shared timing across press feedback, small controls and panel motion. |

Styling is responsive web CSS. Test narrow and wide layouts, keyboard navigation, pointer drag/cancellation, reduced motion and the opaque/frosted paths. Browser results apply to the tested configuration.
