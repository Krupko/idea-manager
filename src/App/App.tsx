import './App.scss';
import { Burger } from '@/components/ui/Icon/Burger';
import { Button } from '../components/Button/Button.tsx';
import { Download } from '@/components/ui/Icon/Download.tsx';
import { Bell } from '@/components/ui/Icon/Bell.tsx';
import { Box } from '@/components/ui/Icon/Box.tsx';
import { Heart } from '@/components/ui/Icon/Heart.tsx';
import { Github } from '@/components/ui/Icon/Github.tsx';
import { Image } from '@/components/ui/Icon/Image.tsx';
import { Command } from '@/components/ui/Icon/Command.tsx';
import { Mapping } from '@/components/ui/Icon/Mapping.tsx';
import { Instagram } from '@/components/ui/Icon/Imstagram.tsx';
import { Frame } from '@/components/ui/Icon/Frame.tsx';

function App() {
  return (
    <>
      <main className='frame'>
        <section className='sitebar'>
          <div className='list-icon'>
            <Button className='sitebar-button'>
              <Burger className='sitebar-icon' />
            </Button>
            <Bell className='sitebar-icon' />
            <Box className='sitebar-icon' />
            <Heart className='sitebar-icon' />
            <Github className='sitebar-icon' />
            <Command className='sitebar-icon' />
            <Frame className='sitebar-icon' />
            <Image className='sitebar-icon' />
            <Mapping className='sitebar-icon' />
            <Instagram className='sitebar-icon' />
          </div>

          <Button className='sitebar-button'>
            <Download className='sitebar-icon' />
          </Button>
        </section>

        <div className='test bg-amber-700'></div>
      </main>
    </>
  );
}

export default App;
