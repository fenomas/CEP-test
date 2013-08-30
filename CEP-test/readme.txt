

** This demo uses an HTML5-based custom UI panel, which is supported from 
   the Flash update called "Avatar". The custom panel can't be used 
   unless you have the Avatar update. You can, however, examine and build 
   the custom panel contents without Avatar.


1. To edit the custom extension panel, you'll need ExtensionBuilder 3.
   It's currently available on Adobe Labs:
      from http://labs.adobe.com/technologies/extensionbuilder3/
2. After installing Extension Builder, import custom project:
   File > Import > General > Existing Project, then select the 
   /extension-source/FlashMetadata/ folder.
3. After editing the custom extension, test or debug it by selecting 
   Run > Run or Run > Debug.  This will install the custom panel to 
   Flash Pro (version Avatar or later).
4. Open level.fla
5. Open the custom panel by selecting Window > Extension > FlashMetadata
6. Select the movieclips on the stage and view or change their physical properties.
7. Open exporter.jsfl in Flash (for editing)
8. Run the JSFL script by clicking the "Play" button in the JSFL script window
9. The exporter script will create (or overwrite) files in the /levelData folder
10. Confirm the animation by viewing /build/index.html  in a browser.
    The cocos2d app is edited to load resources out of the levelData folder.
    (Depending on your browser and OS, viewing cocos2d apps from local files
     may not work unless you use a local http server like MAMP, or upload your 
     files to a server.)


