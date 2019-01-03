{ pkgs ? import <nixpkgs> {} }: with pkgs; 
let deps = [ cmake xorg.libX11 xorg.libXtst xorg.libXext xorg.xinput xorg.libXi libpng zlib libxkbcommon nodejs xorg.libXinerama xorg.libXt libnotify xclip ];
in stdenv.mkDerivation {
  name = "clipscord";
  buildInputs = deps;
  shellHook = ''
  export LD_LIBRARY_PATH="${stdenv.lib.makeLibraryPath deps}:$LD_LIBRARY_PATH"
  '';
}
